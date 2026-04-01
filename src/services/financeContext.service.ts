import pool from "../config/db";
import NodeCache from "node-cache";

// 5-minute TTL; entries are invalidated immediately on data mutation
const budgetCache = new NodeCache({ stdTTL: 300 });

export const invalidateBudgetCache = (userId: string): void => {
  budgetCache.del(`finance_context_${userId}`);
};

export interface CategoryStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
}

export interface FinancialContext {
  month: string;
  dayOfMonth: number;   // days elapsed in budget period (1 = first day)
  daysRemaining: number; // days left in budget period
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  dailyVelocity: number;
  projectedRunOutDay: number | null;
  categoryStatus: CategoryStatus[];
  recentExpenses: any[];
  activeGoals: any[];
  healthScore: number | null;
  weeklySpendTrend: {
    last7Days: number;
    prev7Days: number;
    percentageChange: number;
  };
}

export const buildFinancialContext = async (userId: string): Promise<FinancialContext | null> => {
  const cacheKey = `finance_context_${userId}`;
  const cached = budgetCache.get<FinancialContext>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

  // Find active budget by period dates — same query as getCurrentBudget.
  // This fixes the calendar-month mismatch for cross-month budgets.
  const budgetResult = await pool.query(
    `SELECT * FROM budgets
     WHERE user_id = $1 AND start_date <= $2 AND end_date >= $2
     ORDER BY start_date DESC LIMIT 1`,
    [userId, todayStr]
  );
  if (budgetResult.rows.length === 0) return null;

  const budgetRow = budgetResult.rows[0];
  const periodStart = new Date(budgetRow.start_date);
  const periodEnd = new Date(budgetRow.end_date);

  // Time math relative to the budget period (not the calendar month).
  // daysElapsed: 1 on first day, totalDays on last day.
  // daysRemaining: totalDays-1 on first day, 0 on last day.
  // daysElapsed + daysRemaining = totalDays, so dayOfMonth + daysRemaining
  // in the AI advisor still equals total period days. ✓
  const totalDays = Math.round((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysElapsed = Math.min(
    totalDays,
    Math.round((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
  const daysRemaining = Math.max(0, totalDays - daysElapsed);

  // Expense aggregation scoped to the budget period (not startOfMonth–endOfMonth).
  const expenseQuery = `
    SELECT
      COALESCE(SUM(category_total), 0) AS total_spent,
      COALESCE(
        jsonb_object_agg(category, category_total),
        '{}'::jsonb
      ) AS category_spending
    FROM (
      SELECT category, SUM(amount) AS category_total
      FROM expenses
      WHERE user_id = $1
        AND date >= $2
        AND date <= $3
        AND type = 'expense'
      GROUP BY category
    ) sub
  `;

  const recentExpensesQuery = `
    SELECT amount, category, description, date
    FROM expenses
    WHERE user_id = $1 AND type = 'expense'
    ORDER BY date DESC LIMIT 10
  `;
  const activeGoalsQuery = `
    SELECT title, target_amount, saved_amount, deadline
    FROM savings_goals
    WHERE user_id = $1 AND deadline >= CURRENT_DATE
  `;
  const healthScoreQuery = `
    SELECT score FROM health_scores
    WHERE user_id = $1 ORDER BY computed_at DESC LIMIT 1
  `;
  const weeklyTrendQuery = `
    SELECT
      COALESCE(SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN amount ELSE 0 END), 0)  AS last_7_days,
      COALESCE(SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '14 days'
                         AND date <  CURRENT_DATE - INTERVAL '7 days'  THEN amount ELSE 0 END), 0) AS prev_7_days
    FROM expenses
    WHERE user_id = $1 AND type = 'expense'
  `;

  const [expenseRes, expensesRes, goalsRes, healthRes, trendRes] = await Promise.all([
    pool.query(expenseQuery, [userId, budgetRow.start_date, budgetRow.end_date]),
    pool.query(recentExpensesQuery, [userId]),
    pool.query(activeGoalsQuery, [userId]),
    pool.query(healthScoreQuery, [userId]),
    pool.query(weeklyTrendQuery, [userId]),
  ]);

  const totalBudget = parseFloat(budgetRow.amount || budgetRow.total_income);
  const totalSpent = parseFloat(expenseRes.rows[0].total_spent);
  const remainingBudget = totalBudget - totalSpent;

  // Daily velocity: average spend per elapsed day.
  // Zero-guarded: on day 0 (shouldn't happen, but safe) return 0.
  const dailyVelocity = daysElapsed > 0 ? Math.round(totalSpent / daysElapsed) : 0;

  // projectedRunOutDay: which day of the period the budget depletes.
  // Capped at totalDays (never past end of period).
  const projectedRunOutDay = dailyVelocity > 0
    ? Math.min(totalDays, daysElapsed + Math.floor(remainingBudget / dailyVelocity))
    : totalDays;

  const categoryLimits: Record<string, number> = budgetRow.category_limits || {};
  const categorySpending: Record<string, number> = expenseRes.rows[0].category_spending || {};

  const categoryStatus: CategoryStatus[] = Object.entries(categoryLimits).map(([category, limit]) => {
    const spent = categorySpending[category] || 0;
    return {
      category,
      limit: Number(limit),
      spent: Number(spent),
      remaining: Number(limit) - Number(spent),
    };
  });

  const last7 = parseFloat(trendRes.rows[0].last_7_days);
  const prev7 = parseFloat(trendRes.rows[0].prev_7_days);
  const percentageChange = prev7 === 0
    ? (last7 > 0 ? 100 : 0)
    : Math.round(((last7 - prev7) / prev7) * 100);

  const result: FinancialContext = {
    month: budgetRow.start_date.substring(0, 7), // "YYYY-MM" for reference
    dayOfMonth: daysElapsed,    // days elapsed in budget period
    daysRemaining,              // days left in budget period
    totalBudget,
    totalSpent,
    remainingBudget,
    dailyVelocity,
    projectedRunOutDay,
    categoryStatus,
    recentExpenses: expensesRes.rows,
    activeGoals: goalsRes.rows,
    healthScore: healthRes.rows.length > 0 ? healthRes.rows[0].score : null,
    weeklySpendTrend: { last7Days: last7, prev7Days: prev7, percentageChange },
  };

  budgetCache.set(cacheKey, result);
  return result;
};
