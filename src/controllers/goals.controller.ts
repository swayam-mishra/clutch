import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";
import { ok, fail } from "../utils/response";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Valid icon keys the frontend maps to IconData
const VALID_ICONS = ["laptop", "travel", "shield", "phone", "home", "other"];

// Format a Date as "31 Dec 2026"
const formatTargetDate = (d: Date): string => {
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${day} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

const computeGoalFields = (row: any) => {
  const today = new Date();
  const targetDate = new Date(row.deadline || row.target_date);
  const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const targetAmount = parseFloat(row.target_amount);
  const savedAmount = parseFloat(row.saved_amount || "0");
  const remaining = targetAmount - savedAmount;

  let estimatedCompletion = `${MONTH_NAMES[targetDate.getMonth()]} ${targetDate.getFullYear()}`;

  const daysElapsed = Math.ceil((today.getTime() - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24));
  if (daysElapsed > 0 && savedAmount > 0 && remaining > 0) {
    const dailyRate = savedAmount / daysElapsed;
    const daysToComplete = remaining / dailyRate;
    const completionDate = new Date(today.getTime() + daysToComplete * 1000 * 60 * 60 * 24);
    const effectiveDate = completionDate < targetDate ? completionDate : targetDate;
    estimatedCompletion = `${MONTH_NAMES[effectiveDate.getMonth()]} ${effectiveDate.getFullYear()}`;
  }

  const rawIcon = row.icon_key ?? "other";
  const icon = VALID_ICONS.includes(rawIcon) ? rawIcon : "other";

  return {
    id: row.id,
    name: row.title || row.name,
    icon,
    targetAmount,
    savedAmount,
    targetDate: formatTargetDate(targetDate),
    daysRemaining,
    estimatedCompletion,
  };
};

// GET /api/goals
export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      "SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY deadline ASC",
      [req.user?.id]
    );
    ok(res, { goals: result.rows.map(computeGoalFields) });
  } catch (error) {
    fail(res, 500, "Failed to fetch goals.", "INTERNAL_ERROR");
  }
};

// POST /api/goals
export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, icon = "other", targetAmount, targetDate } = req.body;

    if (!name || !targetAmount || !targetDate) {
      fail(res, 400, "name, targetAmount, and targetDate are required.", "VALIDATION_ERROR");
      return;
    }

    const iconKey = VALID_ICONS.includes(icon) ? icon : "other";

    const result = await pool.query(
      `INSERT INTO savings_goals (user_id, title, target_amount, deadline, monthly_contribution, icon_key)
       VALUES ($1, $2, $3, $4, 0, $5)
       RETURNING *`,
      [userId, name, parseFloat(targetAmount), targetDate, iconKey]
    );

    ok(res, computeGoalFields(result.rows[0]), 201);
  } catch (error) {
    fail(res, 500, "Failed to create goal.", "INTERNAL_ERROR");
  }
};

// PUT /api/goals/:id
export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const goalId = req.params.id;
    const { savedAmount } = req.body;

    if (savedAmount === undefined) {
      fail(res, 400, "savedAmount is required.", "VALIDATION_ERROR");
      return;
    }

    const result = await pool.query(
      `UPDATE savings_goals SET saved_amount = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [parseFloat(savedAmount), goalId, userId]
    );

    if (result.rows.length === 0) {
      fail(res, 404, "Goal not found.", "GOAL_NOT_FOUND");
      return;
    }

    ok(res, computeGoalFields(result.rows[0]));
  } catch (error) {
    fail(res, 500, "Failed to update goal.", "INTERNAL_ERROR");
  }
};
