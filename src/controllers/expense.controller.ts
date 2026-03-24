import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";
import { invalidateBudgetCache } from "../services/financeContext.service";
import anthropic from "../config/ai";
import { ok, fail } from "../utils/response";

const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Bills",
  "Education",
  "Other",
];

// Format a Date to { date: "YYYY-MM-DD", time: "HH:mm" }
const formatDateTime = (d: Date) => {
  const date = d.toISOString().split("T")[0];
  const time = d.toISOString().substring(11, 16);
  return { date, time };
};

const toExpenseShape = (row: any) => {
  const dt = formatDateTime(new Date(row.date || row.created_at));
  return {
    id: row.id,
    date: dt.date,
    time: dt.time,
    tag: row.tag ?? row.description ?? "",
    category: row.category,
    amount: parseFloat(row.amount),
    confidence: row.confidence ?? 100,
  };
};

// POST /api/expenses
export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { amount, tag, category, confidence = 100 } = req.body;

    if (!amount || !tag || !category) {
      fail(res, 400, "amount, tag, and category are required.", "VALIDATION_ERROR");
      return;
    }

    const result = await pool.query(
      `INSERT INTO expenses (user_id, amount, category, tag, description, confidence)
       VALUES ($1, $2, $3, $4, $4, $5)
       RETURNING *`,
      [userId, parseFloat(amount), category, tag, parseInt(confidence)]
    );

    if (userId) invalidateBudgetCache(userId);
    ok(res, toExpenseShape(result.rows[0]), 201);
  } catch (error) {
    console.error("Error creating expense:", error);
    fail(res, 500, "Failed to create expense.", "INTERNAL_ERROR");
  }
};

// GET /api/expenses
export const getExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { date, category, search, limit, offset } = req.query;

    const take = limit ? Math.min(parseInt(limit as string), 100) : 50;
    const skip = offset ? parseInt(offset as string) : 0;

    const conditions: string[] = ["user_id = $1"];
    const params: any[] = [userId];
    let idx = 2;

    if (date) {
      conditions.push(`date::date = $${idx++}`);
      params.push(date as string);
    }
    if (category) {
      conditions.push(`category = $${idx++}`);
      params.push(category);
    }
    if (search) {
      conditions.push(`(tag ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.join(" AND ");

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `SELECT * FROM expenses WHERE ${where} ORDER BY date DESC LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, take, skip]
      ),
      pool.query(`SELECT COUNT(*) FROM expenses WHERE ${where}`, params),
    ]);

    const total = parseInt(countResult.rows[0].count);
    ok(res, {
      expenses: dataResult.rows.map(toExpenseShape),
      total,
      hasMore: skip + take < total,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    fail(res, 500, "Failed to fetch expenses.", "INTERNAL_ERROR");
  }
};

// POST /api/expenses/categorize
export const categorizeExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tag } = req.body;

    if (!tag) {
      fail(res, 400, "tag is required.", "VALIDATION_ERROR");
      return;
    }

    const prompt = `You are a financial expense categorizer. Given the expense description, return a JSON object with exactly two keys:
- "category": one of exactly these values: ${CATEGORIES.map(c => `"${c}"`).join(", ")}
- "confidence": integer 0–100 indicating how confident you are

Expense: "${tag}"

Respond ONLY with valid JSON. Example: {"category": "Food & Dining", "confidence": 92}`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 30,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (response.content[0] as { type: string; text: string }).text.trim();
    // Strip markdown code fences if Claude wraps the response
    const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(text);
    const category = CATEGORIES.includes(parsed.category) ? parsed.category : "Other";
    const confidence = Math.min(100, Math.max(0, parseInt(parsed.confidence) || 70));

    ok(res, { category, confidence });
  } catch (error) {
    console.error("Error categorizing expense:", error);
    fail(res, 500, "Failed to categorize expense.", "AI_ERROR");
  }
};

// DELETE /api/expenses/:id
export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await pool.query(
      "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) {
      fail(res, 404, "Expense not found.", "EXPENSE_NOT_FOUND");
      return;
    }

    if (userId) invalidateBudgetCache(userId);
    ok(res, {});
  } catch (error) {
    console.error("Error deleting expense:", error);
    fail(res, 500, "Failed to delete expense.", "INTERNAL_ERROR");
  }
};
