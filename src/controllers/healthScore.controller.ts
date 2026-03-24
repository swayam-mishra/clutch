import { Response } from "express";
import pool from "../config/db";
import { calculateAndSaveHealthScore } from "../services/healthScore.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { ok, fail } from "../utils/response";

const statusFromScore = (score: number): "doing well" | "watch out" | "off track" => {
  if (score >= 80) return "doing well";
  if (score >= 60) return "watch out";
  return "off track";
};

const buildFactors = (factors: any, score: number) => {
  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));

  const adherenceScore = clamp(factors.adherence ?? factors.budgetAdherence ?? score);
  const velocityScore  = clamp(factors.velocity  ?? factors.spendingBalance  ?? score);
  const streakScore    = clamp(factors.streak     ?? factors.consistency      ?? score);

  return [
    {
      title: "adherence",
      subtitle: "Budget Adherence",
      score: adherenceScore,
      description: adherenceScore >= 80
        ? "You stayed within budget well this month."
        : adherenceScore >= 50
        ? "Your spending is slightly above pace for this point in the month."
        : "You've exceeded your budget pace — try to slow spending.",
    },
    {
      title: "velocity",
      subtitle: "Spending Velocity",
      score: velocityScore,
      description: velocityScore >= 80
        ? "Your spending pace is on track for the month."
        : velocityScore >= 50
        ? "Your spending velocity is slightly above target."
        : "At your current pace, you may run out before month end.",
    },
    {
      title: "streak",
      subtitle: "Logging Streak",
      score: streakScore,
      description: streakScore >= 80
        ? "Great logging consistency — you're building a solid habit."
        : streakScore >= 50
        ? "Try to log expenses daily to keep your streak going."
        : "You haven't logged recently. Daily logging improves your score.",
    },
  ];
};

const generateTips = (factors: ReturnType<typeof buildFactors>) => {
  const tips: { tip: string; challengeName: string | null }[] = [];

  const adherence = factors.find(f => f.title === "adherence")!;
  const velocity  = factors.find(f => f.title === "velocity")!;
  const streak    = factors.find(f => f.title === "streak")!;

  if (adherence.score < 70) {
    tips.push({
      tip: "Your budget adherence is below target. Try the ₹200/day Cap challenge to build discipline.",
      challengeName: "₹200/day Cap",
    });
  }
  if (velocity.score < 70) {
    tips.push({
      tip: "Your spending velocity is high. Plan your purchases in advance to avoid running out early.",
      challengeName: null,
    });
  }
  if (streak.score < 70) {
    tips.push({
      tip: "Log expenses every day to improve your streak score and stay aware of your spending.",
      challengeName: "7-Day Logging Streak",
    });
  }

  if (tips.length === 0) {
    tips.push({
      tip: "You're doing great! Keep logging consistently and staying within your daily limit.",
      challengeName: null,
    });
  }

  return tips.slice(0, 3);
};

// GET /api/health/score
export const getLatestScore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id!;

    let scoreRow = (await pool.query(
      "SELECT * FROM health_scores WHERE user_id = $1 ORDER BY computed_at DESC LIMIT 1",
      [userId]
    )).rows[0];

    if (!scoreRow) {
      const newScore = await calculateAndSaveHealthScore(userId);
      if (!newScore) {
        fail(res, 404, "Could not calculate health score. Ensure budget exists.", "BUDGET_NOT_FOUND");
        return;
      }
      scoreRow = (await pool.query(
        "SELECT * FROM health_scores WHERE user_id = $1 ORDER BY computed_at DESC LIMIT 1",
        [userId]
      )).rows[0];
    }

    const trendResult = await pool.query(
      "SELECT score FROM health_scores WHERE user_id = $1 ORDER BY computed_at DESC LIMIT 7",
      [userId]
    );
    const trendRaw = trendResult.rows.map((r: any) => r.score as number).reverse();
    while (trendRaw.length < 7) trendRaw.unshift(scoreRow.score);
    const trendScores = trendRaw.slice(-7);

    const score = scoreRow.score as number;
    const factors = buildFactors(scoreRow.factors, score);

    ok(res, {
      score,
      status: statusFromScore(score),
      factors,
      trendScores,
      tips: generateTips(factors),
    });
  } catch (error: any) {
    console.error("[health/score] caught:", error?.message ?? error);
    fail(res, 500, "Failed to fetch health score.", "INTERNAL_ERROR");
  }
};
