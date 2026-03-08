import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";

export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query("SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY deadline ASC;", [req.user?.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to fetch goals." });
  }
};

export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { title, targetAmount, deadline, monthlyContribution } = req.body;
    
    const query = `
      INSERT INTO savings_goals (user_id, title, target_amount, deadline, monthly_contribution)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const result = await pool.query(query, [userId, title, targetAmount, deadline, monthlyContribution]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to create goal." });
  }
};

export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const goalId = req.params.id;
    const { title, targetAmount, deadline, monthlyContribution } = req.body;

    const query = `
      UPDATE savings_goals 
      SET title = COALESCE($1, title), target_amount = COALESCE($2, target_amount), 
          deadline = COALESCE($3, deadline), monthly_contribution = COALESCE($4, monthly_contribution)
      WHERE id = $5 AND user_id = $6 RETURNING *;
    `;
    const result = await pool.query(query, [title, targetAmount, deadline, monthlyContribution, goalId, userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to update goal." });
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query("DELETE FROM savings_goals WHERE id = $1 AND user_id = $2;", [req.params.id, req.user?.id]);
    res.json({ message: "Goal deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to delete goal." });
  }
};

export const contributeToGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const goalId = req.params.id;
    const { amount } = req.body;

    const query = `
      UPDATE savings_goals SET saved_amount = saved_amount + $1 
      WHERE id = $2 AND user_id = $3 RETURNING *;
    `;
    const result = await pool.query(query, [parseFloat(amount), goalId, userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to contribute to goal." });
  }
};
