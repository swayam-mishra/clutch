import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";
import { invalidateBudgetCache } from "../services/financeContext.service";

// POST /api/expenses — Log a new expense
export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { amount, category, description, date, moodTag } = req.body;

    if (!userId || !amount || !category) {
      res.status(400).json({
        error: true,
        code: "VALIDATION_ERROR",
        message: "amount and category are required.",
        statusCode: 400,
      });
      return;
    }

    const query = `
      INSERT INTO expenses (user_id, amount, category, description, date, mood_tag)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      userId,
      parseFloat(amount),
      category,
      description || null,
      date ? new Date(date) : new Date(),
      moodTag || null,
    ];

    const result = await pool.query(query, values);
    if (userId) invalidateBudgetCache(userId);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to create expense.",
      statusCode: 500,
    });
  }
};

// GET /api/expenses — Get all expenses (filterable by month, category, date range, paginated)
export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { month, category, startDate, endDate, limit, offset } = req.query;

    const take = limit ? parseInt(limit as string) : 20;
    const skip = offset ? parseInt(offset as string) : 0;

    // Build dynamic WHERE clause
    const conditions: string[] = ["user_id = $1"];
    const params: any[] = [userId];
    let paramIdx = 2;

    if (category) {
      conditions.push(`category = $${paramIdx++}`);
      params.push(category);
    }

    if (month) {
      const [year, mon] = (month as string).split("-").map(Number);
      conditions.push(`date >= $${paramIdx++} AND date < $${paramIdx++}`);
      params.push(new Date(year, mon - 1, 1), new Date(year, mon, 1));
    } else if (startDate || endDate) {
      if (startDate) {
        conditions.push(`date >= $${paramIdx++}`);
        params.push(new Date(startDate as string));
      }
      if (endDate) {
        conditions.push(`date <= $${paramIdx++}`);
        params.push(new Date(endDate as string));
      }
    }

    const whereClause = conditions.join(" AND ");

    const expensesQuery = `
      SELECT * FROM expenses
      WHERE ${whereClause}
      ORDER BY date DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++};
    `;
    params.push(take, skip);

    const countQuery = `SELECT COUNT(*) FROM expenses WHERE ${whereClause};`;

    const [expensesResult, countResult] = await Promise.all([
      pool.query(expensesQuery, params),
      pool.query(countQuery, params.slice(0, params.length - 2)),
    ]);

    res.json({
      expenses: expensesResult.rows,
      total: parseInt(countResult.rows[0].count),
      limit: take,
      offset: skip,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to fetch expenses.",
      statusCode: 500,
    });
  }
};

// GET /api/expenses/summary — Aggregated totals by category for current month
export const getExpenseSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { month } = req.query;

    // Default to current month
    const now = new Date();
    const targetMonth = month
      ? (month as string)
      : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const [year, mon] = targetMonth.split("-").map(Number);
    const startOfMonth = new Date(year, mon - 1, 1);
    const endOfMonth = new Date(year, mon, 1);

    const query = `
      SELECT category, SUM(amount) as total
      FROM expenses
      WHERE user_id = $1 AND date >= $2 AND date < $3
      GROUP BY category;
    `;

    const result = await pool.query(query, [userId, startOfMonth, endOfMonth]);

    const categoryBreakdown: Record<string, number> = {};
    let totalSpent = 0;

    for (const row of result.rows) {
      const amount = parseFloat(row.total);
      categoryBreakdown[row.category] = amount;
      totalSpent += amount;
    }

    res.json({
      month: targetMonth,
      totalSpent,
      categoryBreakdown,
      expenseCount: result.rows.reduce(
        (sum: number, _row: any) => sum + 1,
        0
      ),
    });
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to fetch expense summary.",
      statusCode: 500,
    });
  }
};

// GET /api/expenses/:id — Get single expense
export const getExpenseById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await pool.query(
      "SELECT * FROM expenses WHERE id = $1 AND user_id = $2;",
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: true,
        code: "EXPENSE_NOT_FOUND",
        message: "Expense not found.",
        statusCode: 404,
      });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to fetch expense.",
      statusCode: 500,
    });
  }
};

// PUT /api/expenses/:id — Update an expense
export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { amount, category, description, date, moodTag } = req.body;

    // Check existence and ownership
    const existing = await pool.query(
      "SELECT id FROM expenses WHERE id = $1 AND user_id = $2;",
      [id, userId]
    );
    if (existing.rows.length === 0) {
      res.status(404).json({
        error: true,
        code: "EXPENSE_NOT_FOUND",
        message: "Expense not found.",
        statusCode: 404,
      });
      return;
    }

    // Build dynamic SET clause
    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (amount !== undefined) {
      setClauses.push(`amount = $${paramIdx++}`);
      params.push(parseFloat(amount));
    }
    if (category !== undefined) {
      setClauses.push(`category = $${paramIdx++}`);
      params.push(category);
    }
    if (description !== undefined) {
      setClauses.push(`description = $${paramIdx++}`);
      params.push(description);
    }
    if (date !== undefined) {
      setClauses.push(`date = $${paramIdx++}`);
      params.push(new Date(date));
    }
    if (moodTag !== undefined) {
      setClauses.push(`mood_tag = $${paramIdx++}`);
      params.push(moodTag);
    }

    if (setClauses.length === 0) {
      res.status(400).json({
        error: true,
        code: "VALIDATION_ERROR",
        message: "No fields to update.",
        statusCode: 400,
      });
      return;
    }

    params.push(id, userId);
    const query = `
      UPDATE expenses SET ${setClauses.join(", ")}
      WHERE id = $${paramIdx} AND user_id = $${paramIdx + 1}
      RETURNING *;
    `;

    const result = await pool.query(query, params);    if (userId) invalidateBudgetCache(userId);    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to update expense.",
      statusCode: 500,
    });
  }
};

// DELETE /api/expenses/:id — Delete an expense
export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await pool.query(
      "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id;",
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: true,
        code: "EXPENSE_NOT_FOUND",
        message: "Expense not found.",
        statusCode: 404,
      });
      return;
    }

    if (userId) invalidateBudgetCache(userId);
    res.json({ message: "Expense deleted successfully." });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to delete expense.",
      statusCode: 500,
    });
  }
};
