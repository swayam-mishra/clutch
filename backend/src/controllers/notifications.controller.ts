import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";

export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { deviceToken, notificationsEnabled } = req.body;

    const query = `
      UPDATE users 
      SET device_token = COALESCE($1, device_token),
          notifications_enabled = COALESCE($2, notifications_enabled)
      WHERE id = $3
      RETURNING notifications_enabled, device_token;
    `;

    const result = await pool.query(query, [deviceToken, notificationsEnabled, userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to update notification preferences." });
  }
};
