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

  // 2. Weekly Review Generator — Sundays at 6:00 PM
  cron.schedule("0 18 * * 0", async () => {
    console.log("[CRON] Triggering weekly review generations...");
    try {
      const usersQuery = `SELECT id, name, device_token FROM users WHERE notifications_enabled = true;`;
      const usersResult = await pool.query(usersQuery);

      for (const user of usersResult.rows) {
        const expensesQuery = `
          SELECT amount, category, description, date 
          FROM expenses 
          WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days';
        `;
        const expensesResult = await pool.query(expensesQuery, [user.id]);

        if (expensesResult.rows.length === 0) continue;

        const totalWeeklySpend = expensesResult.rows.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0);

        const systemPrompt = `You are Clutch, a supportive financial AI coach. Summarize the user's weekly spending in 2-3 sentences. Focus on trends and provide one actionable tip for next week. Be conversational and non-judgmental.`;
        const userPrompt = `Here are my expenses from the last 7 days totaling ₹${totalWeeklySpend}: ${JSON.stringify(expensesResult.rows)}`;

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          temperature: 0.5,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });

        const summary = (response.content[0] as { type: string; text: string }).text;

        await pool.query(
          `INSERT INTO weekly_reviews (user_id, summary, week_start_date) VALUES ($1, $2, CURRENT_DATE - INTERVAL '7 days')`,
          [user.id, summary]
        );

        if (user.device_token) {
          await admin.messaging().send({
            token: user.device_token,
            notification: {
              title: "📊 Your Weekly Money Review is Ready!",
              body: "Tap to see where your money went this week and get your personalized tip."
            }
          });
        }
      }
      console.log("[CRON] Weekly reviews generated successfully.");
    } catch (error) {
      console.error("[CRON] Error generating weekly reviews:", error);
    }
  });
};
