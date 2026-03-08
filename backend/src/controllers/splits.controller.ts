import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";

// POST /api/splits
export const createSplit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { expenseId, splitWithName, amountOwed } = req.body;

    const query = `
      INSERT INTO splits (expense_id, user_id, split_with_name, amount_owed)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [expenseId, userId, splitWithName, parseFloat(amountOwed)]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to create split expense." });
  }
};

// GET /api/splits
export const getSplits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const query = `
      SELECT s.id as split_id, s.split_with_name, s.amount_owed, s.is_settled, s.created_at,
             e.description as expense_description, e.amount as total_expense_amount, e.date
      FROM splits s
      JOIN expenses e ON s.expense_id = e.id
      WHERE s.user_id = $1
      ORDER BY s.is_settled ASC, s.created_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to fetch splits." });
  }
};

// PUT /api/splits/:id/settle
export const settleSplit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const splitId = req.params.id;

    const query = `
      UPDATE splits 
      SET is_settled = true 
      WHERE id = $1 AND user_id = $2 
      RETURNING *;
    `;
    const result = await pool.query(query, [splitId, userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: true, message: "Split record not found." });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to settle split." });
  }
};
