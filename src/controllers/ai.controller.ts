import { Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import anthropic from "../config/ai";
import pool from "../config/db";
import { buildFinancialContext } from "../services/financeContext.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { ok, fail } from "../utils/response";

const CLAUDE_SONNET = "claude-sonnet-4-20250514";
const CLAUDE_HAIKU = "claude-haiku-4-5-20251001";

// POST /api/advisor/analyze
export const analyzeAdvisor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id!;
    const { item, itemName, price } = req.body;
    const purchaseItem = itemName ?? item;

    if (!purchaseItem || price === undefined) {
      fail(res, 400, "item and price are required.", "VALIDATION_ERROR");
      return;
    }

    const financialContext = await buildFinancialContext(userId);

    if (!financialContext) {
      fail(res, 404, "No budget found. Please set your monthly budget first.", "BUDGET_NOT_FOUND");
      return;
    }

    const remaining = financialContext.remainingBudget;
    const priceNum = parseFloat(price);
    const totalDays = financialContext.dayOfMonth + financialContext.daysRemaining;
    const dailyBudget = financialContext.totalBudget > 0 && totalDays > 0
      ? parseFloat((financialContext.totalBudget / totalDays).toFixed(2))
      : 0;
    const afterPurchase = parseFloat((remaining - priceNum).toFixed(2));
    const percentOfBudget = remaining > 0
      ? parseFloat(((priceNum / remaining) * 100).toFixed(2))
      : 100;

    const budgetImpact = { dailyBudget, remaining, afterPurchase, percentOfBudget };

    // Velocity note
    const velocity = financialContext.dailyVelocity;
    const velocityNote: string =
      velocity <= dailyBudget * 0.8
        ? "Your spending pace is well under control."
        : velocity <= dailyBudget * 1.2
        ? "Your spending is roughly on track."
        : "You're spending faster than your daily budget allows.";

    // Goal impacts
    const goalsResult = await pool.query(
      `SELECT title, target_amount, saved_amount, deadline
       FROM savings_goals WHERE user_id = $1 AND deadline >= CURRENT_DATE`,
      [userId]
    );

    const goalImpacts = goalsResult.rows.map((g: any) => {
      const needed = parseFloat(g.target_amount) - parseFloat(g.saved_amount);
      const today = new Date();
      const deadline = new Date(g.deadline);
      const daysLeft = Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      const dailyGoalRate = needed / daysLeft;
      const delayDays = dailyGoalRate > 0 ? Math.round(priceNum / dailyGoalRate) : 0;
      return { goalName: g.title, delayDays: Math.max(0, delayDays) };
    }).sort((a: any, b: any) => b.delayDays - a.delayDays);

    const staticSystemPrompt = `You are Clutch, a warm, intelligent, non-judgmental AI money coach for students and young adults.`;

    const dynamicContext = `
Financial context:
- Remaining budget: ₹${remaining.toFixed(2)}
- Days left in period: ${financialContext.daysRemaining}
- Daily velocity: ₹${velocity}/day vs daily budget ₹${dailyBudget}
- This purchase is ${percentOfBudget}% of remaining budget

Respond ONLY with a JSON object with exactly these two keys:
- "verdict": exactly one of "go for it", "think twice", or "skip it"
- "reason": 1-2 sentence friendly, lowercase explanation
`;

    const response = await anthropic.messages.create({
      model: CLAUDE_SONNET,
      max_tokens: 150,
      temperature: 0.2,
      system: [
        { type: "text", text: staticSystemPrompt, cache_control: { type: "ephemeral" } },
        { type: "text", text: dynamicContext },
      ],
      messages: [{ role: "user", content: `Should I buy ${purchaseItem} for ₹${price}?` }],
    } as Parameters<typeof anthropic.messages.create>[0]) as Anthropic.Message;

    const raw = (response.content[0] as { type: string; text: string }).text.trim();
    const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const aiResult = JSON.parse(text);

    // Validate verdict is one of the allowed strings; fall back if AI drifts
    const validVerdicts = ["go for it", "think twice", "skip it"];
    const verdict = validVerdicts.includes(aiResult.verdict) ? aiResult.verdict : "think twice";

    ok(res, {
      verdict,
      reason: aiResult.reason,
      budgetImpact,
      velocityNote,
      goalImpacts,
    });
  } catch (error) {
    console.error("Error in purchase advisor:", error);
    fail(res, 500, "Failed to generate purchase advice.", "AI_ERROR");
  }
};

// POST /api/chat/message
export const chatMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id!;
    const { message, history = [] } = req.body;

    if (!message) {
      fail(res, 400, "message is required.", "VALIDATION_ERROR");
      return;
    }

    const financialContext = await buildFinancialContext(userId);

    const systemPrompt = `you are clutch, a calm and friendly money coach for young adults. be concise, conversational, and lowercase. no lectures.

financial context:
${financialContext ? JSON.stringify(financialContext, null, 2) : "user hasn't set up a budget yet."}`;

    const formattedHistory = (history as { role: string; content: string }[]).map(m => ({
      role: m.role === "user" ? "user" : "assistant" as "user" | "assistant",
      content: m.content,
    }));
    formattedHistory.push({ role: "user", content: message });

    const response = await anthropic.messages.create({
      model: CLAUDE_HAIKU,
      max_tokens: 400,
      temperature: 0.7,
      system: systemPrompt,
      messages: formattedHistory,
    } as Parameters<typeof anthropic.messages.create>[0]) as Anthropic.Message;

    ok(res, { response: (response.content[0] as { type: string; text: string }).text });
  } catch (error) {
    console.error("Error in chat:", error);
    fail(res, 500, "Failed to generate chat response.", "AI_ERROR");
  }
};

// GET /api/ai/weekly-review (internal/worker — not part of frontend spec)
export const getWeeklyReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      "SELECT * FROM weekly_reviews WHERE user_id = $1 ORDER BY week_start_date DESC LIMIT 1",
      [userId]
    );
    if (result.rows.length === 0) {
      fail(res, 404, "No weekly reviews found yet.", "NOT_FOUND");
      return;
    }
    ok(res, result.rows[0]);
  } catch (error) {
    fail(res, 500, "Failed to fetch weekly review.", "INTERNAL_ERROR");
  }
};
