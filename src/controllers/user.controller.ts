import { Response } from "express";
import pool from "../config/db";
import { supabase } from "../config/supabase";
import { AuthRequest } from "../middleware/auth.middleware";
import { ok, fail } from "../utils/response";

// GET /api/user/profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, preferences FROM users WHERE id = $1",
      [req.user?.id]
    );
    if (result.rows.length === 0) {
      fail(res, 404, "User not found.", "NOT_FOUND");
      return;
    }
    ok(res, result.rows[0]);
  } catch (error) {
    fail(res, 500, "Failed to fetch profile.", "INTERNAL_ERROR");
  }
};

// PUT /api/user/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id!;
    const { name, email } = req.body;

    if (!name && !email) {
      fail(res, 400, "At least name or email is required.", "VALIDATION_ERROR");
      return;
    }

    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name), email = COALESCE($2, email)
       WHERE id = $3
       RETURNING id, name, email, preferences`,
      [name ?? null, email ?? null, userId]
    );

    if (email) {
      await supabase.auth.admin.updateUserById(userId, { email });
    }

    ok(res, result.rows[0]);
  } catch (error) {
    fail(res, 500, "Failed to update profile.", "INTERNAL_ERROR");
  }
};

// PUT /api/user/password
export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id!;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      fail(res, 400, "currentPassword and newPassword are required.", "VALIDATION_ERROR");
      return;
    }
    if (newPassword.length < 6) {
      fail(res, 400, "New password must be at least 6 characters.", "VALIDATION_ERROR");
      return;
    }

    const profileResult = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
    const email = profileResult.rows[0]?.email;

    if (!email) {
      fail(res, 404, "User not found.", "NOT_FOUND");
      return;
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (verifyError) {
      fail(res, 400, "Current password is incorrect.", "INVALID_CREDENTIALS");
      return;
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
    if (updateError) {
      console.error("[updatePassword] supabase.auth.admin.updateUserById error:", updateError);
      fail(res, 500, "Failed to update password.", "INTERNAL_ERROR");
      return;
    }

    ok(res, {});
  } catch (error: any) {
    console.error("[updatePassword] caught exception:", error?.message ?? error);
    fail(res, 500, "Failed to update password.", "INTERNAL_ERROR");
  }
};

// PUT /api/user/preferences
export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { spendingAlerts, goalReminders, challengeNudges, appLock } = req.body;

    const prefs: Record<string, boolean> = {};
    if (spendingAlerts !== undefined) prefs.spendingAlerts = Boolean(spendingAlerts);
    if (goalReminders !== undefined) prefs.goalReminders = Boolean(goalReminders);
    if (challengeNudges !== undefined) prefs.challengeNudges = Boolean(challengeNudges);
    if (appLock !== undefined) prefs.appLock = Boolean(appLock);

    const result = await pool.query(
      `UPDATE users
       SET preferences = COALESCE(preferences, '{}'::jsonb) || $1::jsonb
       WHERE id = $2
       RETURNING preferences`,
      [JSON.stringify(prefs), userId]
    );

    ok(res, result.rows[0]?.preferences ?? prefs);
  } catch (error) {
    fail(res, 500, "Failed to update preferences.", "INTERNAL_ERROR");
  }
};
