import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";

// POST /api/budget — Create or update monthly budget (upsert)
export const createOrUpdateBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { month, totalIncome, categoryLimits } = req.body;

    if (!userId || !month || totalIncome === undefined || !categoryLimits) {
      res.status(400).json({
        error: true,
        code: "VALIDATION_ERROR",
        message: "month, totalIncome, and categoryLimits are required.",
        statusCode: 400,
      });
      return;
    }

    // Validate month format YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(month)) {
      res.status(400).json({
        error: true,
        code: "VALIDATION_ERROR",
        message: 'month must be in "YYYY-MM" format.',
        statusCode: 400,
      });
      return;
    }

    const query = `
      INSERT INTO budgets (user_id, month, total_income, category_limits)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, month)
      DO UPDATE SET total_income = $3, category_limits = $4
      RETURNING *;
    `;

    const values = [
      userId,
      month,
      parseFloat(totalIncome),
      JSON.stringify(categoryLimits),
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating/updating budget:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to create/update budget.",
      statusCode: 500,
    });
  }
};

// GET /api/budget/:month — Get budget for a given month
export const getBudgetByMonth = async (req: AuthRequest, res: Response) => {
  try {
    const { month } = req.params;
    const userId = req.user?.id;

    const result = await pool.query(
      "SELECT * FROM budgets WHERE user_id = $1 AND month = $2;",
      [userId, month]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: true,
        code: "BUDGET_NOT_FOUND",
        message: `No budget found for ${month}. Please set your monthly budget first.`,
        statusCode: 404,
      });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching budget:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to fetch budget.",
      statusCode: 500,
    });
  }
};

// GET /api/budget/:month/status — Real-time spend vs. budget with velocity
export const getBudgetStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { month } = req.params;
    const userId = req.user?.id;

    const budgetResult = await pool.query(
      "SELECT * FROM budgets WHERE user_id = $1 AND month = $2;",
      [userId, month]
    );

    if (budgetResult.rows.length === 0) {
      res.status(404).json({
        error: true,
        code: "BUDGET_NOT_FOUND",
        message: `No budget found for ${month}.`,
        statusCode: 404,
      });
      return;
    }

    const budget = budgetResult.rows[0];

    // Fetch expenses for this month
    const [year, mon] = (month as string).split("-").map(Number);
    const startOfMonth = new Date(year, mon - 1, 1);
    const endOfMonth = new Date(year, mon, 1);

    const expensesResult = await pool.query(
      "SELECT * FROM expenses WHERE user_id = $1 AND date >= $2 AND date < $3;",
      [userId, startOfMonth, endOfMonth]
    );

    const expenses = expensesResult.rows;

    // Calculate totals
    const totalSpent = expenses.reduce(
      (sum: number, e: any) => sum + parseFloat(e.amount),
      0
    );
    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(year, mon, 0).getDate();
    const daysRemaining = Math.max(0, daysInMonth - dayOfMonth);
    const spendVelocity =
      dayOfMonth > 0 ? Math.round(totalSpent / dayOfMonth) : 0;
    const projectedTotal = spendVelocity * daysInMonth;
    const totalIncome = parseFloat(budget.total_income);
    const projectedEndBalance = totalIncome - projectedTotal;

    // Calculate projected run-out day
    const remainingBudget = totalIncome - totalSpent;
    const projectedRunOutDay =
      spendVelocity > 0
        ? Math.min(
            daysInMonth,
            dayOfMonth + Math.floor(remainingBudget / spendVelocity)
          )
        : daysInMonth;

    // Category-level status
    const categoryLimits = budget.category_limits as Record<string, number>;
    const categorySpend: Record<string, number> = {};
    for (const expense of expenses) {
      categorySpend[expense.category] =
        (categorySpend[expense.category] || 0) + parseFloat(expense.amount);
    }

    const categoryStatus = Object.entries(categoryLimits).map(
      ([category, limit]) => {
        const spent = categorySpend[category] || 0;
        const percentUsed = limit > 0 ? Math.round((spent / limit) * 100) : 0;
        let status: "safe" | "warning" | "over" = "safe";
        if (percentUsed >= 100) status = "over";
        else if (percentUsed >= 70) status = "warning";

        return { category, limit, spent, percentUsed, status };
      }
    );

    res.json({
      month,
      totalBudget: totalIncome,
      totalSpent,
      dayOfMonth,
      daysRemaining,
      spendVelocity,
      projectedEndBalance,
      projectedRunOutDay,
      categoryStatus,
    });
  } catch (error) {
    console.error("Error fetching budget status:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to fetch budget status.",
      statusCode: 500,
    });
  }
};
