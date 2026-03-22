import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";

// GET /api/challenges/active
export const getActiveChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const query = `
      SELECT uc.id as user_challenge_id, c.title, c.description, c.target_amount, 
             c.duration_days, uc.progress, uc.start_date, uc.status
      FROM user_challenges uc
      JOIN challenges c ON uc.challenge_id = c.id
      WHERE uc.user_id = $1 AND uc.status = 'active';
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to fetch active challenges." });
  }
};

// GET /api/challenges/available
export const getAvailableChallenges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const query = `
      SELECT * FROM challenges 
      WHERE id NOT IN (
        SELECT challenge_id FROM user_challenges 
        WHERE user_id = $1 AND status = 'active'
      );
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to fetch available challenges." });
  }
};

// POST /api/challenges/:id/join
export const joinChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const challengeId = req.params.id;

    const query = `
      INSERT INTO user_challenges (user_id, challenge_id, status)
      VALUES ($1, $2, 'active')
      RETURNING *;
    `;
    const result = await pool.query(query, [userId, challengeId]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to join challenge." });
  }
};

// PUT /api/challenges/:id/progress
export const updateProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userChallengeId = req.params.id;
    const { amountAdded, markCompleted } = req.body;

    let query = "";
    let values: any[] = [];

    if (markCompleted) {
      query = `UPDATE user_challenges SET status = 'completed' WHERE id = $1 AND user_id = $2 RETURNING *;`;
      values = [userChallengeId, userId];
    } else {
      query = `UPDATE user_challenges SET progress = progress + $1 WHERE id = $2 AND user_id = $3 RETURNING *;`;
      values = [parseFloat(amountAdded), userChallengeId, userId];
    }

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to update progress." });
  }
};

// GET /api/challenges/history
export const getChallengeHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const query = `
      SELECT uc.id as user_challenge_id, c.title, uc.status, uc.progress, uc.start_date
      FROM user_challenges uc
      JOIN challenges c ON uc.challenge_id = c.id
      WHERE uc.user_id = $1 AND uc.status != 'active'
      ORDER BY uc.start_date DESC;
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to fetch challenge history." });
  }
};
