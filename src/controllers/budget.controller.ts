import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";
import { ok, fail } from "../utils/response";

// POST /api/budget — create or update budget (upsert by user + month derived from startDate)
export const createOrUpdateBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { amount, currency = "INR", startDate, endDate, distribution = "distribute" } = req.body;

    if (!amount || !startDate || !endDate) {
      fail(res, 400, "amount, startDate, and endDate are required.", "VALIDATION_ERROR");
      return;
    }

    // Derive month string from startDate
    const month = startDate.substring(0, 7); // "2026-03-01" → "2026-03"

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dailyLimit = parseFloat((parseFloat(amount) / totalDays).toFixed(2));

    const query = `
      INSERT INTO budgets (user_id, month, total_income, category_limits, amount, currency, start_date, end_date, distribution)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id, month)
      DO UPDATE SET
        total_income = $3,
        amount = $5,
        currency = $6,
        start_date = $7,
        end_date = $8,
        distribution = $9
      RETURNING id, amount, currency, start_date, end_date, distribution;
    `;

    const result = await pool.query(query, [
      userId,
      month,
      parseFloat(amount),
      "{}",
      parseFloat(amount),
      currency,
      startDate,
      endDate,
      distribution,
    ]);

    const row = result.rows[0];
    ok(res, {
      id: row.id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      startDate: row.start_date,
      endDate: row.end_date,
      distribution: row.distribution,
      totalDays,
      dailyLimit,
    }, 201);
  } catch (error) {
    console.error("Error creating/updating budget:", error);
    fail(res, 500, "Failed to create/update budget.", "INTERNAL_ERROR");
  }
};

// GET /api/budget/current — current month budget with live computed stats
export const getCurrentBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

    const budgetResult = await pool.query(
      `SELECT * FROM budgets
       WHERE user_id = $1 AND start_date <= $2 AND end_date >= $2
       ORDER BY start_date DESC LIMIT 1`,
      [userId, todayStr]
    );

    if (budgetResult.rows.length === 0) {
      fail(res, 404, "No active budget found. Please set your monthly budget first.", "BUDGET_NOT_FOUND");
      return;
    }

    const budget = budgetResult.rows[0];
    const startDate = new Date(budget.start_date);
    const endDate = new Date(budget.end_date);
    const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysElapsed = Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysLeft = Math.max(0, totalDays - daysElapsed + 1);

    const amount = parseFloat(budget.amount || budget.total_income);

    // Fetch total spent this period
    const spentResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = $1 AND date >= $2 AND date <= $3`,
      [userId, budget.start_date, budget.end_date]
    );
    const spent = parseFloat(spentResult.rows[0].total);
    const remaining = parseFloat((amount - spent).toFixed(2));

    // Fetch today's spend
    const todayStart = `${todayStr}T00:00:00Z`;
    const todayEnd = `${todayStr}T23:59:59Z`;
    const todaySpentResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = $1 AND date >= $2 AND date <= $3`,
      [userId, todayStart, todayEnd]
    );
    const todaySpent = parseFloat(todaySpentResult.rows[0].total);

    const dailyLimit = daysLeft > 0 ? parseFloat((remaining / daysLeft).toFixed(2)) : 0;
    const todayRemaining = parseFloat((dailyLimit - todaySpent).toFixed(2));
    const percentUsed = amount > 0 ? parseFloat(((spent / amount) * 100).toFixed(2)) : 0;

    // Format month string: "march 2026"
    const monthNames = ["january","february","march","april","may","june","july","august","september","october","november","december"];
    const monthStr = `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;

    ok(res, {
      id: budget.id,
      amount,
      currency: budget.currency ?? "INR",
      startDate: budget.start_date,
      endDate: budget.end_date,
      distribution: budget.distribution ?? "distribute",
      totalDays,
      daysLeft,
      daysElapsed,
      spent,
      remaining,
      dailyLimit,
      todayRemaining,
      todaySpent,
      percentUsed,
      month: monthStr,
    });
  } catch (error) {
    console.error("Error fetching current budget:", error);
    fail(res, 500, "Failed to fetch budget.", "INTERNAL_ERROR");
  }
};
