import cron from "node-cron";
import pool from "../config/db";
import admin from "firebase-admin";
import anthropic from "../config/ai";

// Initialize Firebase Admin (Ensure process.env.GOOGLE_APPLICATION_CREDENTIALS is set)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

export const initCronJobs = () => {
  // 1. Daily Budget Check - 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("[CRON] Running daily budget check nudges...");
    try {
      const query = `
        WITH current_month_expenses AS (
          SELECT user_id, SUM(amount) as total_spent
          FROM expenses
          WHERE date >= date_trunc('month', CURRENT_DATE)
          GROUP BY user_id
        )
        SELECT 
          b.user_id, 
          b.total_income, 
          COALESCE(e.total_spent, 0) as spent,
          u.notifications_enabled,
          u.device_token
        FROM budgets b
        JOIN users u ON b.user_id = u.id
        LEFT JOIN current_month_expenses e ON b.user_id = e.user_id
        WHERE b.month = to_char(CURRENT_DATE, 'YYYY-MM')
        AND COALESCE(e.total_spent, 0) > (b.total_income * 0.8)
        AND u.notifications_enabled = true;
      `;

      const result = await pool.query(query);

      for (const row of result.rows) {
        const spentPct = Math.round((row.spent / row.total_income) * 100);

        if (row.device_token) {
          await admin.messaging().send({
            token: row.device_token,
            notification: {
              title: "⚠️ Budget Alert",
              body: `You have spent ${spentPct}% (₹${row.spent}) of your monthly budget. Slow down!`
            }
          });
          console.log(`[NUDGE DISPATCHED] FCM sent to User ${row.user_id}`);
        }
      }
    } catch (error) {
      console.error("[CRON] Error running daily budget check:", error);
    }
  });

  // 2. Weekly Review Generator (Batch Creation) — Sundays at 6:00 PM
  cron.schedule("0 18 * * 0", async () => {
    console.log("[CRON] Bundling weekly reviews into a batch...");
    try {
      const usersQuery = `SELECT id, name, device_token FROM users WHERE notifications_enabled = true;`;
      const usersResult = await pool.query(usersQuery);

      const requests: {
        custom_id: string;
        params: {
          model: string;
          max_tokens: number;
          temperature: number;
          system: string;
          messages: { role: string; content: string }[];
        };
      }[] = [];

      const systemPrompt = `You are Clutch, a supportive financial AI coach. Summarize the user's weekly spending in 2-3 sentences. Focus on trends and provide one actionable tip for next week. Be conversational and non-judgmental.`;

      for (const user of usersResult.rows) {
        const expensesQuery = `
          SELECT amount, category, description, date 
          FROM expenses 
          WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days';
        `;
        const expensesResult = await pool.query(expensesQuery, [user.id]);

        if (expensesResult.rows.length === 0) continue;

        const totalWeeklySpend = expensesResult.rows.reduce(
          (sum: number, exp: any) => sum + parseFloat(exp.amount),
          0
        );

        requests.push({
          custom_id: user.id.toString(),
          params: {
            model: "claude-3-haiku-20240307", // Lever #3: Haiku (20x cheaper than Sonnet)
            max_tokens: 200,
            temperature: 0.5,
            system: systemPrompt,
            messages: [
              {
                role: "user",
                content: `Here are my expenses from the last 7 days totaling ₹${totalWeeklySpend}: ${JSON.stringify(expensesResult.rows)}`,
              },
            ],
          },
        });
      }

      if (requests.length === 0) {
        console.log("[CRON] No users with expenses this week, skipping batch.");
        return;
      }

      // Lever #2: Single batch submission (50% cheaper than individual requests)
      const messageBatch = await (anthropic.messages.batches as any).create({ requests });
      console.log(`[CRON] Batch created: ${messageBatch.id} for ${requests.length} users.`);

      await pool.query(
        `INSERT INTO batch_jobs (batch_id, status, created_at) VALUES ($1, 'processing', NOW())`,
        [messageBatch.id]
      );
    } catch (error) {
      console.error("[CRON] Error creating weekly review batch:", error);
    }
  });

  // 3. Batch Result Poller — Every 10 minutes, process completed batches
  cron.schedule("*/10 * * * *", async () => {
    try {
      const pendingBatches = await pool.query(
        `SELECT batch_id FROM batch_jobs WHERE status = 'processing'`
      );
      if (pendingBatches.rows.length === 0) return;

      for (const row of pendingBatches.rows) {
        const batchId: string = row.batch_id;
        const batchStatus = await (anthropic.messages.batches as any).retrieve(batchId);

        if (batchStatus.processing_status !== "ended") continue;

        console.log(`[CRON] Processing completed batch: ${batchId}`);
        const results = await (anthropic.messages.batches as any).results(batchId);

        for await (const result of results) {
          const userId: string = result.custom_id;

          if (result.result.type !== "succeeded") {
            console.warn(`[CRON] Batch result failed for user ${userId}:`, result.result);
            continue;
          }

          const summary = (result.result.message.content[0] as { text: string }).text;

          await pool.query(
            `INSERT INTO weekly_reviews (user_id, summary, week_start_date)
             VALUES ($1, $2, CURRENT_DATE - INTERVAL '7 days')
             ON CONFLICT DO NOTHING`,
            [userId, summary]
          );

          const userRes = await pool.query(
            `SELECT device_token FROM users WHERE id = $1`,
            [userId]
          );
          const deviceToken = userRes.rows[0]?.device_token;

          if (deviceToken) {
            await admin.messaging().send({
              token: deviceToken,
              notification: {
                title: "📊 Your Weekly Money Review is Ready!",
                body: "Tap to see where your money went this week and get your personalized tip.",
              },
            });
          }
        }

        await pool.query(
          `UPDATE batch_jobs SET status = 'completed' WHERE batch_id = $1`,
          [batchId]
        );
        console.log(`[CRON] Batch ${batchId} fully processed.`);
      }
    } catch (error) {
      console.error("[CRON] Error polling batch status:", error);
    }
  });
