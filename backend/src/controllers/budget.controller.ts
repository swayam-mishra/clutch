import { Request, Response } from "express";
import prisma from "../config/prisma";

// POST /api/budget — Create or update monthly budget (upsert)
export const createOrUpdateBudget = async (req: Request, res: Response) => {
  try {
    const { userId, month, totalIncome, categoryLimits } = req.body;

    if (!userId || !month || totalIncome === undefined || !categoryLimits) {
      res.status(400).json({
        error: true,
        code: "VALIDATION_ERROR",
        message: "userId, month, totalIncome, and categoryLimits are required.",
        statusCode: 400,
      });
      return;
    }

    // Validate month format YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(month)) {
      res.status(400).json({
        error: true,
        code: "VALIDATION_ERROR",
        message: 'month must be in "YYYY-MM" format.',
        statusCode: 400,
      });
      return;
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_month: { userId, month },
      },
      update: {
        totalIncome: parseFloat(totalIncome),
        categoryLimits,
      },
      create: {
        userId,
        month,
        totalIncome: parseFloat(totalIncome),
        categoryLimits,
      },
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error("Error creating/updating budget:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to create/update budget.",
      statusCode: 500,
    });
  }
};

// GET /api/budget/:month — Get budget for a given month
export const getBudgetByMonth = async (req: Request, res: Response) => {
  try {
    const { month } = req.params;
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({
        error: true,
        code: "VALIDATION_ERROR",
        message: "userId query parameter is required.",
        statusCode: 400,
      });
      return;
    }

    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: { userId: userId as string, month },
      },
    });

    if (!budget) {
      res.status(404).json({
        error: true,
        code: "BUDGET_NOT_FOUND",
        message: `No budget found for ${month}. Please set your monthly budget first.`,
        statusCode: 404,
      });
      return;
    }

    res.json(budget);
  } catch (error) {
    console.error("Error fetching budget:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to fetch budget.",
      statusCode: 500,
    });
  }
};

// GET /api/budget/:month/status — Real-time spend vs. budget with velocity
export const getBudgetStatus = async (req: Request, res: Response) => {
  try {
    const { month } = req.params;
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({
        error: true,
        code: "VALIDATION_ERROR",
        message: "userId query parameter is required.",
        statusCode: 400,
      });
      return;
    }

    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: { userId: userId as string, month },
      },
    });

    if (!budget) {
      res.status(404).json({
        error: true,
        code: "BUDGET_NOT_FOUND",
        message: `No budget found for ${month}.`,
        statusCode: 404,
      });
      return;
    }

    // Fetch expenses for this month
    const [year, mon] = month.split("-").map(Number);
    const startOfMonth = new Date(year, mon - 1, 1);
    const endOfMonth = new Date(year, mon, 1);

    const expenses = await prisma.expense.findMany({
      where: {
        userId: userId as string,
        date: { gte: startOfMonth, lt: endOfMonth },
      },
    });

    // Calculate totals
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(year, mon, 0).getDate();
    const daysRemaining = Math.max(0, daysInMonth - dayOfMonth);
    const spendVelocity =
      dayOfMonth > 0 ? Math.round(totalSpent / dayOfMonth) : 0;
    const projectedTotal = spendVelocity * daysInMonth;
    const projectedEndBalance = budget.totalIncome - projectedTotal;

    // Calculate projected run-out day
    const remainingBudget = budget.totalIncome - totalSpent;
    const projectedRunOutDay =
      spendVelocity > 0
        ? Math.min(
            daysInMonth,
            dayOfMonth + Math.floor(remainingBudget / spendVelocity)
          )
        : daysInMonth;

    // Category-level status
    const categoryLimits = budget.categoryLimits as Record<string, number>;
    const categorySpend: Record<string, number> = {};
    for (const expense of expenses) {
      categorySpend[expense.category] =
        (categorySpend[expense.category] || 0) + expense.amount;
    }

    const categoryStatus = Object.entries(categoryLimits).map(
      ([category, limit]) => {
        const spent = categorySpend[category] || 0;
        const percentUsed = limit > 0 ? Math.round((spent / limit) * 100) : 0;
        let status: "safe" | "warning" | "over" = "safe";
        if (percentUsed >= 100) status = "over";
        else if (percentUsed >= 70) status = "warning";

        return { category, limit, spent, percentUsed, status };
      }
    );

    res.json({
      month,
      totalBudget: budget.totalIncome,
      totalSpent,
      dayOfMonth,
      daysRemaining,
      spendVelocity,
      projectedEndBalance,
      projectedRunOutDay,
      categoryStatus,
    });
  } catch (error) {
    console.error("Error fetching budget status:", error);
    res.status(500).json({
      error: true,
      code: "INTERNAL_ERROR",
      message: "Failed to fetch budget status.",
      statusCode: 500,
    });
  }
};
