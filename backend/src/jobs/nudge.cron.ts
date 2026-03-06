import cron from "node-cron";
import pool from "../config/db";

export const initCronJobs = () => {
  // Run every day at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("[CRON] Running daily budget check nudges...");

    try {
      // Raw SQL to find users who have spent > 80% of their budget.
      // Uses a CTE to sum current month expenses and joins against their budget.
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
          u.notifications_enabled
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

        // MVP: Log the notification.
        // In Production: Send via Firebase Cloud Messaging (FCM) or Email (SendGrid)
        console.log(
          `[NUDGE DISPATCHED] User ${row.user_id}: You have spent ${spentPct}% (₹${row.spent}) of your monthly budget. Slow down!`
        );
      }

      console.log(`[CRON] Budget check complete. Evaluated ${result.rows.length} at-risk users.`);
    } catch (error) {
      console.error("[CRON] Error running daily budget check:", error);
    }
  });

  // Weekly Review Generator — runs every Sunday at 6 PM
  cron.schedule("0 18 * * 0", async () => {
    console.log("[CRON] Triggering weekly review generations...");
    // Future logic: Iterate over users, call Claude to summarize the week, and save to a `weekly_reviews` table.
  });
};
