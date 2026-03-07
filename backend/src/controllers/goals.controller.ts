import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";

export const contributeToGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const goalId = req.params.id;
    const { amount } = req.body;

    const query = `
      UPDATE savings_goals 
      SET saved_amount = saved_amount + $1 
      WHERE id = $2 AND user_id = $3 
      RETURNING *;
    `;
    const result = await pool.query(query, [parseFloat(amount), goalId, userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: true, message: "Goal not found." });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to contribute to goal." });
  }
};
