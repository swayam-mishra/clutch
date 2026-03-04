import { Request, Response } from "express";
import prisma from "../config/prisma";

// POST /api/expenses — Log a new expense
export const createExpense = async (req: Request, res: Response) => {
  try {
    const { userId, amount, category, description, date, moodTag } = req.body;

    if (!userId || !amount || !category) {
      res.status(400).json({
        error: true,
        code: "VALIDATION_ERROR",
        message: "userId, amount, and category are required.",
        statusCode: 400,
      });
      return;
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        amount: parseFloat(amount),
        category,
        description: description || null,
        date: date ? new Date(date) : new Date(),
        moodTag: moodTag || null,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to create expense.",
      statusCode: 500,
    });
  }
};

// GET /api/expenses — Get all expenses (filterable by month, category, date range, paginated)
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { userId, month, category, startDate, endDate, limit, offset } =
      req.query;

    if (!userId) {
      res.status(400).json({
        error: true,
        code: "VALIDATION_ERROR",
        message: "userId query parameter is required.",
        statusCode: 400,
      });
      return;
    }

    // Build filter conditions
    const where: any = { userId: userId as string };

    if (category) {
      where.category = category as string;
    }

    if (month) {
      // month format: "YYYY-MM"
      const [year, mon] = (month as string).split("-").map(Number);
      where.date = {
        gte: new Date(year, mon - 1, 1),
        lt: new Date(year, mon, 1),
      };
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const take = limit ? parseInt(limit as string) : 20;
    const skip = offset ? parseInt(offset as string) : 0;

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      take,
      skip,
    });

    const total = await prisma.expense.count({ where });

    res.json({ expenses, total, limit: take, offset: skip });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to fetch expenses.",
      statusCode: 500,
    });
  }
};

// GET /api/expenses/summary — Aggregated totals by category for current month
export const getExpenseSummary = async (req: Request, res: Response) => {
  try {
    const { userId, month } = req.query;

    if (!userId) {
      res.status(400).json({
        error: true,
        code: "VALIDATION_ERROR",
        message: "userId query parameter is required.",
        statusCode: 400,
      });
      return;
    }

    // Default to current month
    const now = new Date();
    const targetMonth = month
      ? (month as string)
      : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const [year, mon] = targetMonth.split("-").map(Number);
    const startOfMonth = new Date(year, mon - 1, 1);
    const endOfMonth = new Date(year, mon, 1);

    const expenses = await prisma.expense.findMany({
      where: {
        userId: userId as string,
        date: { gte: startOfMonth, lt: endOfMonth },
      },
    });

    // Group by category
    const categoryTotals: Record<string, number> = {};
    let totalSpent = 0;

    for (const expense of expenses) {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
      totalSpent += expense.amount;
    }

    res.json({
      month: targetMonth,
      totalSpent,
      categoryBreakdown: categoryTotals,
      expenseCount: expenses.length,
    });
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to fetch expense summary.",
      statusCode: 500,
    });
  }
};

// GET /api/expenses/:id — Get single expense
export const getExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({ where: { id } });

    if (!expense) {
      res.status(404).json({
        error: true,
        code: "EXPENSE_NOT_FOUND",
        message: "Expense not found.",
        statusCode: 404,
      });
      return;
    }

    res.json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to fetch expense.",
      statusCode: 500,
    });
  }
};

// PUT /api/expenses/:id — Update an expense
export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date, moodTag } = req.body;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({
        error: true,
        code: "EXPENSE_NOT_FOUND",
        message: "Expense not found.",
        statusCode: 404,
      });
      return;
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(moodTag !== undefined && { moodTag }),
      },
    });

    res.json(expense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to update expense.",
      statusCode: 500,
    });
  }
};

// DELETE /api/expenses/:id — Delete an expense
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({
        error: true,
        code: "EXPENSE_NOT_FOUND",
        message: "Expense not found.",
        statusCode: 404,
      });
      return;
    }

    await prisma.expense.delete({ where: { id } });

    res.json({ message: "Expense deleted successfully." });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to delete expense.",
      statusCode: 500,
    });
  }
};
