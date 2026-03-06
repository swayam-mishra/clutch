import pool from "../config/db";


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
}

// ---------------------------------------------------------------------------
// 2. Service Implementation
// ---------------------------------------------------------------------------

/**
 * Builds a strictly-typed financial context object for the current month
 * to be injected into the AI system prompt.
 * * @param userId - The UUID of the user
 * @returns FinancialContext object or null if no budget is set
 */
export const buildFinancialContext = async (userId: string): Promise<FinancialContext | null> => {
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

  // 3. Optimized Aggregation SQL (Single Round-Trip)
  const query = `
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

  const values = [userId, currentMonthStr, startOfMonth, endOfMonth];
  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    // No budget found for this user for the current month
    return null;
  }

  const row = result.rows[0];
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

  // 4. Return the strictly typed context
  return {
    month: currentMonthStr,
    dayOfMonth,
    daysRemaining,
    totalBudget,
    totalSpent,
    remainingBudget,
    dailyVelocity,
    projectedRunOutDay,
    categoryStatus
  };
};