import { Response } from "express";
import pool from "../config/db";
import { calculateAndSaveHealthScore } from "../services/healthScore.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const getLatestScore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: true, message: "Authentication required." });
      return;
    }

    const result = await pool.query(
      "SELECT * FROM health_scores WHERE user_id = $1 ORDER BY computed_at DESC LIMIT 1;",
      [userId]
    );

    if (result.rows.length === 0) {
      // If no score exists, calculate one on the fly
      const newScore = await calculateAndSaveHealthScore(userId as string);
      if (!newScore) {
        res.status(404).json({ error: true, message: "Could not calculate health score. Ensure budget exists." });
        return;
      }
      res.json(newScore);
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching latest health score:", error);
    res.status(500).json({ error: true, message: "Failed to fetch health score." });
  }
};

export const getScoreHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: true, message: "Authentication required." });
      return;
    }

    const result = await pool.query(
      "SELECT * FROM health_scores WHERE user_id = $1 AND computed_at >= CURRENT_DATE - INTERVAL '30 days' ORDER BY computed_at DESC;",
      [userId]
    );

    res.set("Cache-Control", "private, max-age=300");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching health score history:", error);
    res.status(500).json({ error: true, message: "Failed to fetch health score history." });
  }
};
