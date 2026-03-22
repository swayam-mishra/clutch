import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";

// POST /api/notifications/register
export const registerToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { deviceToken } = req.body;
    await pool.query("UPDATE users SET device_token = $1 WHERE id = $2", [deviceToken, userId]);
    res.json({ message: "Device token registered successfully." });
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to register token." });
  }
};

// GET /api/notifications/settings
export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      "SELECT notifications_enabled, weekly_review_day FROM users WHERE id = $1", 
      [userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to fetch settings." });
  }
};

// PUT /api/notifications/settings
export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { notificationsEnabled, weeklyReviewDay } = req.body;

    const query = `
      UPDATE users 
      SET notifications_enabled = COALESCE($1, notifications_enabled),
          weekly_review_day = COALESCE($2, weekly_review_day)
      WHERE id = $3
      RETURNING notifications_enabled, weekly_review_day;
    `;
    
    const result = await pool.query(query, [notificationsEnabled, weeklyReviewDay, userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to update notification preferences." });
  }
};
