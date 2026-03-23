import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";
import { ok, fail } from "../utils/response";

const toActiveShape = (row: any) => {
  const today = new Date();
  const startDate = new Date(row.start_date);
  const totalDays = parseInt(row.duration_days);
  const daysElapsed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysLeft = Math.max(0, totalDays - daysElapsed);
  const progress = totalDays > 0 ? parseFloat(Math.min(1, daysElapsed / totalDays).toFixed(2)) : 0;

  return {
    id: row.challenge_id || row.id,
    name: row.name ?? row.title,
    description: row.description,
    iconKey: row.icon_key ?? "emoji_events",
    difficulty: row.difficulty ?? "medium",
    duration: `${totalDays} days`,
    daysLeft,
    totalDays,
    progress,
    reward: row.reward ?? null,
    rewardIconKey: row.reward_icon_key ?? "workspace_premium",
    color: row.color_scheme ?? "primary",
  };
};

const toAvailableShape = (row: any) => ({
  id: row.id,
  name: row.name ?? row.title,
  description: row.description,
  iconKey: row.icon_key ?? "emoji_events",
  difficulty: row.difficulty ?? "medium",
  duration: `${row.duration_days} days`,
  reward: row.reward ?? null,
  rewardIconKey: row.reward_icon_key ?? "workspace_premium",
});

// GET /api/challenges/active
export const getActiveChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT uc.id, uc.start_date, uc.progress, uc.status,
              c.id AS challenge_id, c.title, c.name, c.description, c.duration_days,
              c.icon_key, c.difficulty, c.reward, c.reward_icon_key, c.color_scheme
       FROM user_challenges uc
       JOIN challenges c ON uc.challenge_id = c.id
       WHERE uc.user_id = $1 AND uc.status = 'active'`,
      [userId]
    );
    ok(res, { challenges: result.rows.map(toActiveShape) });
  } catch (error) {
    fail(res, 500, "Failed to fetch active challenges.", "INTERNAL_ERROR");
  }
};

// GET /api/challenges/available
export const getAvailableChallenges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT * FROM challenges
       WHERE id NOT IN (
         SELECT challenge_id FROM user_challenges WHERE user_id = $1 AND status = 'active'
       )`,
      [userId]
    );
    ok(res, { challenges: result.rows.map(toAvailableShape) });
  } catch (error) {
    fail(res, 500, "Failed to fetch available challenges.", "INTERNAL_ERROR");
  }
};

// POST /api/challenges/:id/join
export const joinChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const challengeId = req.params.id;

    const result = await pool.query(
      `INSERT INTO user_challenges (user_id, challenge_id, status)
       VALUES ($1, $2, 'active')
       RETURNING *`,
      [userId, challengeId]
    );

    const challengeResult = await pool.query(
      `SELECT uc.id, uc.start_date, uc.progress, uc.status,
              c.id AS challenge_id, c.title, c.name, c.description, c.duration_days,
              c.icon_key, c.difficulty, c.reward, c.reward_icon_key, c.color_scheme
       FROM user_challenges uc
       JOIN challenges c ON uc.challenge_id = c.id
       WHERE uc.id = $1`,
      [result.rows[0].id]
    );

    ok(res, toActiveShape(challengeResult.rows[0]), 201);
  } catch (error) {
    fail(res, 500, "Failed to join challenge.", "INTERNAL_ERROR");
  }
};
