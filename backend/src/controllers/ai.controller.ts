import { Request, Response } from "express";
import anthropic from "../config/ai";
import { buildFinancialContext } from "../services/financeContext.service";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export const purchaseAdvisor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, itemDescription, amount } = req.body;

    if (!userId || !itemDescription || !amount) {
      res.status(400).json({
        error: true,
        code: "VALIDATION_ERROR",
        message: "userId, itemDescription, and amount are required.",
        statusCode: 400,
      });
      return;
    }

    const financialContext = await buildFinancialContext(userId);

    if (!financialContext) {
      res.status(404).json({
        error: true,
        code: "BUDGET_NOT_FOUND",
        message: "No budget found. Please set your monthly budget first.",
        statusCode: 404,
      });
      return;
    }

    const systemPrompt = `
      You are Clutch, a warm, intelligent, and non-judgmental AI money coach for students and young adults.
      Your goal is to act as a decision-support system. Evaluate the user's desired purchase based on their current financial reality.
      
      User's real-time financial context:
      ${JSON.stringify(financialContext, null, 2)}
      
      Analyze if they can afford this purchase without compromising their remaining month.
      Respond strictly in JSON format with exactly these keys: "verdict" (must be "YES", "MAYBE", or "NO"), "explanation" (2-3 sentences plain-English reasoning), and "tip" (one constructive suggestion).
      Do not include any other text outside the JSON object.
    `;

    const userPrompt = `I want to buy: ${itemDescription} for ₹${amount}. Should I buy this?`;

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 300,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textResponse = (response.content[0] as { type: string; text: string }).text;
    const aiDecision = JSON.parse(textResponse);

    res.json({
      ...aiDecision,
      contextUsed: {
        remainingBudget: financialContext.remainingBudget,
        daysLeft: financialContext.daysRemaining,
        dailyVelocity: financialContext.dailyVelocity,
      },
    });
  } catch (error) {
    console.error("Error in purchase advisor:", error);
    res.status(500).json({
      error: true,
      code: "AI_ERROR",
      message: "Failed to generate purchase advice.",
      statusCode: 500,
    });
  }
};

export const chatInterface = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, message, conversationHistory = [] } = req.body;

    if (!userId || !message) {
      res.status(400).json({
        error: true,
        code: "VALIDATION_ERROR",
        message: "userId and message are required.",
        statusCode: 400,
      });
      return;
    }

    const financialContext = await buildFinancialContext(userId);

    const systemPrompt = `
      You are Clutch, a calm, intelligent money coach.
      You guide users to make better financial decisions. Be concise, conversational, and non-judgmental.
      Use emojis sparingly.
      
      Here is the user's current financial context (use this to ground your advice):
      ${financialContext ? JSON.stringify(financialContext, null, 2) : "User has not set up a budget yet."}
    `;

    const formattedHistory = conversationHistory.map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    formattedHistory.push({ role: "user", content: message });

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: formattedHistory,
    });

    res.json({
      reply: (response.content[0] as { type: string; text: string }).text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    res.status(500).json({
      error: true,
      code: "AI_ERROR",
      message: "Failed to generate chat response.",
      statusCode: 500,
    });
  }
};
