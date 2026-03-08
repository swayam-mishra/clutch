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
  dayOfMonth: number;
  daysRemaining: number;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  dailyVelocity: number;
  projectedRunOutDay: number | null;
  categoryStatus: CategoryStatus[];
  // New Additions:
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
  const year = now.getFullYear();
  const monthNum = now.getMonth() + 1; // 1-12
  const currentMonthStr = `${year}-${String(monthNum).padStart(2, "0")}`; // "YYYY-MM"
  
  // Date boundaries for SQL
  const startOfMonth = new Date(year, monthNum - 1, 1);
  const endOfMonth = new Date(year, monthNum, 1);
  
  // Time math for velocity
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const daysRemaining = Math.max(0, daysInMonth - dayOfMonth);

  const mainQuery = `
    WITH budget_data AS (
      SELECT total_income, category_limits
      FROM budgets
      WHERE user_id = $1 AND month = $2
    ),
    expense_data AS (
      SELECT 
        COALESCE(SUM(amount), 0) AS total_spent,
        COALESCE(
          jsonb_object_agg(category, category_total), 
          '{}'::jsonb
        ) AS category_spending
      FROM (
        SELECT category, SUM(amount) AS category_total
        FROM expenses
        WHERE user_id = $1 AND date >= $3 AND date < $4
        GROUP BY category
      ) sub
    )
    SELECT 
      b.total_income, 
      b.category_limits, 
      e.total_spent, 
      e.category_spending
    FROM budget_data b
    LEFT JOIN expense_data e ON true;
  `;

  const recentExpensesQuery = `SELECT amount, category, description, date FROM expenses WHERE user_id = $1 ORDER BY date DESC LIMIT 10;`;
  const activeGoalsQuery = `SELECT title, target_amount, saved_amount, deadline FROM savings_goals WHERE user_id = $1 AND deadline >= CURRENT_DATE;`;
  const healthScoreQuery = `SELECT score FROM health_scores WHERE user_id = $1 ORDER BY computed_at DESC LIMIT 1;`;
  const weeklyTrendQuery = `
    SELECT
      COALESCE(SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN amount ELSE 0 END), 0) as last_7_days,
      COALESCE(SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '14 days' AND date < CURRENT_DATE - INTERVAL '7 days' THEN amount ELSE 0 END), 0) as prev_7_days
    FROM expenses WHERE user_id = $1;
  `;

  // Run all queries in parallel for performance
  const [mainRes, expensesRes, goalsRes, healthRes, trendRes] = await Promise.all([
    pool.query(mainQuery, [userId, currentMonthStr, startOfMonth, endOfMonth]),
    pool.query(recentExpensesQuery, [userId]),
    pool.query(activeGoalsQuery, [userId]),
    pool.query(healthScoreQuery, [userId]),
    pool.query(weeklyTrendQuery, [userId])
  ]);

  if (mainRes.rows.length === 0) return null;

  const row = mainRes.rows[0];
  const totalBudget = parseFloat(row.total_income);
  const totalSpent = parseFloat(row.total_spent);
  const remainingBudget = totalBudget - totalSpent;
  
  // Avoid division by zero on the 1st of the month
  const dailyVelocity = dayOfMonth > 0 ? Math.round(totalSpent / dayOfMonth) : 0;
  
  const projectedRunOutDay = dailyVelocity > 0 
    ? Math.min(daysInMonth, dayOfMonth + Math.floor(remainingBudget / dailyVelocity))
    : daysInMonth;

  // Process category statuses
  const categoryLimits: Record<string, number> = row.category_limits || {};
  const categorySpending: Record<string, number> = row.category_spending || {};
  
  const categoryStatus: CategoryStatus[] = Object.entries(categoryLimits).map(([category, limit]) => {
    const spent = categorySpending[category] || 0;
    return {
      category,
      limit: Number(limit),
      spent: Number(spent),
      remaining: Number(limit) - Number(spent)
    };
  });

  const last7 = parseFloat(trendRes.rows[0].last_7_days);
  const prev7 = parseFloat(trendRes.rows[0].prev_7_days);
  const percentageChange = prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 100);

  return {
    month: currentMonthStr,
    dayOfMonth,
    daysRemaining,
    totalBudget,
    totalSpent,
    remainingBudget,
    dailyVelocity,
    projectedRunOutDay,
    categoryStatus,
    recentExpenses: expensesRes.rows,
    activeGoals: goalsRes.rows,
    healthScore: healthRes.rows.length > 0 ? healthRes.rows[0].score : null,
    weeklySpendTrend: {
      last7Days: last7,
      prev7Days: prev7,
      percentageChange
    }
  };

  budgetCache.set(cacheKey, result);
  return result;
};