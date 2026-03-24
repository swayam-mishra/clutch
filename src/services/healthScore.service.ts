import pool from "../config/db";
import { buildFinancialContext } from "./financeContext.service";

export interface HealthScoreResult {
  score: number;
  factors: {
    spendingBalance: number;
    consistency: number;
    budgetAdherence: number;
  };
  explanation: string;
}

/**
 * Calculates a 0-100 financial health score and saves it to the database.
 */
export const calculateAndSaveHealthScore = async (userId: string): Promise<HealthScoreResult | null> => {
  const context = await buildFinancialContext(userId);
  if (!context || context.totalBudget <= 0) return null;

  // Factor 1: Budget Adherence (0 - 40 points)
  const monthProgress = context.dayOfMonth / (context.dayOfMonth + context.daysRemaining);
  const budgetConsumed = context.totalSpent / context.totalBudget;

  let budgetAdherence = 40;
  if (budgetConsumed > monthProgress + 0.1) {
    budgetAdherence = Math.max(0, 40 - ((budgetConsumed - monthProgress) * 100));
  } else if (budgetConsumed > 1) {
    budgetAdherence = 0;
  }

  // Factor 2: Spending Balance / Velocity (0 - 30 points)
  // Is the projected run-out day before the end of the month?
  let spendingBalance = 30;
  if (context.projectedRunOutDay !== null && context.projectedRunOutDay < (context.dayOfMonth + context.daysRemaining)) {
    const daysShort = (context.dayOfMonth + context.daysRemaining) - context.projectedRunOutDay;
    spendingBalance = Math.max(0, 30 - (daysShort * 2));
  }

  // Factor 3: Consistency (0 - 30 points)
  // Does the user log expenses regularly? We check if they logged anything in the last 3 days.
  let consistency = 15; // default baseline
  const recentExpensesQuery = `
    SELECT COUNT(*) as count 
    FROM expenses 
    WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '3 days';
  `;
  const recentResult = await pool.query(recentExpensesQuery, [userId]);
  if (parseInt(recentResult.rows[0].count) > 0) {
    consistency = 30; // Active logging
  }

  const score = Math.min(100, Math.max(0, Math.round(budgetAdherence + spendingBalance + consistency) || 0));

  // Generate a plain-English explanation
  let explanation = "Your finances are looking healthy and on track.";
  if (score < 50) {
    explanation = "You are spending faster than recommended. Consider slowing down discretionary spending.";
  } else if (score < 75) {
    explanation = "You are doing okay, but your spending velocity is slightly high for this point in the month.";
  }

  const factors = {
    budgetAdherence: Math.round(budgetAdherence),
    spendingBalance: Math.round(spendingBalance),
    consistency: Math.round(consistency),
  };

  // Insert into PostgreSQL
  const insertQuery = `
    INSERT INTO health_scores (user_id, score, factors, explanation)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  await pool.query(insertQuery, [userId, score, JSON.stringify(factors), explanation]);

  return { score, factors, explanation };
};
