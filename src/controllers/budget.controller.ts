import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";
import { ok, fail } from "../utils/response";
import { invalidateBudgetCache } from "../services/financeContext.service";

// POST /api/budget — create or update budget (upsert by user + month derived from startDate)
export const createOrUpdateBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { amount, currency = "INR", startDate, endDate, distribution = "distribute" } = req.body;

    if (!amount || !startDate || !endDate) {
      fail(res, 400, "amount, startDate, and endDate are required.", "VALIDATION_ERROR");
      return;
    }

    // Derive month string from startDate
    const month = startDate.substring(0, 7); // "2026-03-01" → "2026-03"

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dailyLimit = parseFloat((parseFloat(amount) / totalDays).toFixed(2));

    const query = `
      INSERT INTO budgets (user_id, month, total_income, category_limits, amount, currency, start_date, end_date, distribution)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id, month)
      DO UPDATE SET
        total_income = $3,
        amount = $5,
        currency = $6,
        start_date = $7,
        end_date = $8,
        distribution = $9
      RETURNING id, amount, currency, start_date, end_date, distribution;
    `;

    // Detect whether this is a brand-new period (first time this month key is
    // created) so we can reset pending_savings. Editing an existing period
    // (same month key) leaves accumulated savings intact.
    const existingResult = await pool.query(
      `SELECT id FROM budgets WHERE user_id = $1 AND month = $2`,
      [userId, month]
    );
    const isNewPeriod = existingResult.rows.length === 0;

    const result = await pool.query(query, [
      userId,
      month,
      parseFloat(amount),
      "{}",
      parseFloat(amount),
      currency,
      startDate,
      endDate,
      distribution,
    ]);

    if (isNewPeriod) {
      await pool.query(
        `UPDATE users SET pending_savings = 0 WHERE id = $1`,
        [userId]
      );
    }

    const row = result.rows[0];
    ok(res, {
      id: row.id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      startDate: row.start_date,
      endDate: row.end_date,
      distribution: row.distribution,
      totalDays,
      dailyLimit,
    }, 201);
  } catch (error) {
    console.error("Error creating/updating budget:", error);
    fail(res, 500, "Failed to create/update budget.", "INTERNAL_ERROR");
  }
};

// GET /api/budget/current — current month budget with live computed stats
export const getCurrentBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

    const budgetResult = await pool.query(
      `SELECT * FROM budgets
       WHERE user_id = $1 AND start_date <= $2 AND end_date >= $2
       ORDER BY start_date DESC LIMIT 1`,
      [userId, todayStr]
    );

    if (budgetResult.rows.length === 0) {
      fail(res, 404, "No active budget found. Please set your monthly budget first.", "BUDGET_NOT_FOUND");
      return;
    }

    const budget = budgetResult.rows[0];
    const startDate = new Date(budget.start_date);
    const endDate = new Date(budget.end_date);
    const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysElapsed = Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysLeft = Math.max(0, totalDays - daysElapsed + 1);

    const amount = parseFloat(budget.amount || budget.total_income);

    // Fetch total spent this period (exclude goal allocations)
    const spentResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = $1 AND date >= $2 AND date <= $3 AND type = 'expense'`,
      [userId, budget.start_date, budget.end_date]
    );
    const spent = parseFloat(spentResult.rows[0].total);
    const remaining = parseFloat((amount - spent).toFixed(2));

    // Fetch today's spend (exclude goal allocations)
    const todayStart = `${todayStr}T00:00:00Z`;
    const todayEnd = `${todayStr}T23:59:59Z`;
    const todaySpentResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = $1 AND date >= $2 AND date <= $3 AND type = 'expense'`,
      [userId, todayStart, todayEnd]
    );
    const todaySpent = parseFloat(todaySpentResult.rows[0].total);

    const dailyLimit = daysLeft > 0 ? parseFloat((remaining / daysLeft).toFixed(2)) : 0;
    const todayRemaining = parseFloat((dailyLimit - todaySpent).toFixed(2));
    const percentUsed = amount > 0 ? parseFloat(((spent / amount) * 100).toFixed(2)) : 0;

    // Format month string: "march 2026"
    const monthNames = ["january","february","march","april","may","june","july","august","september","october","november","december"];
    const monthStr = `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;

    ok(res, {
      id: budget.id,
      amount,
      currency: budget.currency ?? "INR",
      startDate: budget.start_date,
      endDate: budget.end_date,
      distribution: budget.distribution ?? "distribute",
      totalDays,
      daysLeft,
      daysElapsed,
      spent,
      remaining,
      dailyLimit,
      todayRemaining,
      todaySpent,
      percentUsed,
      month: monthStr,
    });
  } catch (error) {
    console.error("Error fetching current budget:", error);
    fail(res, 500, "Failed to fetch budget.", "INTERNAL_ERROR");
  }
};

// GET /api/budget/daily-summary — triggers close-out prompt logic
export const getDailySummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // 1. Load active budget
    const budgetResult = await pool.query(
      `SELECT * FROM budgets WHERE user_id = $1 AND start_date <= $2 AND end_date >= $2 ORDER BY start_date DESC LIMIT 1`,
      [userId, todayStr]
    );

    if (budgetResult.rows.length === 0) {
      ok(res, { needsCloseout: false, type: "none", message: "No active budget." });
      return;
    }

    const budget = budgetResult.rows[0];

    // 2. Check last_closeout_date
    const userResult = await pool.query(
      `SELECT pending_savings, last_closeout_date FROM users WHERE id = $1`,
      [userId]
    );
    const userRow = userResult.rows[0];
    const lastCloseout = userRow?.last_closeout_date
      ? new Date(userRow.last_closeout_date).toISOString().split("T")[0]
      : null;

    if (lastCloseout === todayStr) {
      ok(res, { needsCloseout: false, type: "none", message: "Already closed out today." });
      return;
    }

    // 3. Check if user has any expenses today
    const todayStart = `${todayStr}T00:00:00Z`;
    const todayEnd = `${todayStr}T23:59:59Z`;
    const activityResult = await pool.query(
      `SELECT COUNT(*) AS count FROM expenses
       WHERE user_id = $1 AND date >= $2 AND date <= $3 AND type = 'expense'`,
      [userId, todayStart, todayEnd]
    );
    if (parseInt(activityResult.rows[0].count) === 0) {
      ok(res, { needsCloseout: false, type: "none", message: "No activity today yet." });
      return;
    }

    // 4. Calculate daily budget and today's spend
    const startDate = new Date(budget.start_date);
    const endDate = new Date(budget.end_date);
    const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const budgetAmount = parseFloat(budget.amount || budget.total_income);
    const dailyBudget = parseFloat((budgetAmount / totalDays).toFixed(2));

    const todaySpentResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses
       WHERE user_id = $1 AND date >= $2 AND date <= $3 AND type = 'expense'`,
      [userId, todayStart, todayEnd]
    );
    const spent = parseFloat(todaySpentResult.rows[0].total);
    const surplus = parseFloat((dailyBudget - spent).toFixed(2));

    const pendingSavings = parseFloat(userRow?.pending_savings ?? "0");

    // 5. surplus = 0 → close out silently
    if (surplus === 0) {
      await pool.query(
        `UPDATE users SET last_closeout_date = $1 WHERE id = $2`,
        [todayStr, userId]
      );
      ok(res, { needsCloseout: false, type: "none", message: "Exactly on budget today." });
      return;
    }

    // 6. deficit → auto close out
    if (surplus < 0) {
      await pool.query(
        `UPDATE users SET last_closeout_date = $1 WHERE id = $2`,
        [todayStr, userId]
      );
      ok(res, {
        needsCloseout: true,
        type: "deficit",
        today: { date: todayStr, dailyBudget, spent, surplus },
        deficit: Math.abs(surplus),
      });
      return;
    }

    // 7. surplus → prompt allocation
    const totalPendingSavings = parseFloat((surplus + pendingSavings).toFixed(2));

    const goalsResult = await pool.query(
      `SELECT
         g.id,
         g.title AS name,
         g.icon_key AS icon,
         g.target_amount,
         g.deadline,
         COALESCE(SUM(e.amount), 0) AS saved_amount
       FROM savings_goals g
       LEFT JOIN expenses e
         ON e.goal_id = g.id AND e.type = 'goal_allocation' AND e.user_id = $1
       WHERE g.user_id = $1 AND g.deadline >= CURRENT_DATE
       GROUP BY g.id
       ORDER BY g.deadline ASC`,
      [userId]
    );

    const today = new Date();
    const activeGoals = goalsResult.rows.map((g: any) => {
      const targetAmount = parseFloat(g.target_amount);
      const savedAmount = parseFloat(g.saved_amount);
      const remaining = parseFloat((targetAmount - savedAmount).toFixed(2));
      const deadline = new Date(g.deadline);
      const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      return { id: g.id, name: g.name, icon: g.icon ?? "other", targetAmount, savedAmount, remaining, daysRemaining };
    });

    ok(res, {
      needsCloseout: true,
      type: "surplus",
      today: { date: todayStr, dailyBudget, spent, surplus },
      pendingSavings: totalPendingSavings,
      activeGoals,
    });
  } catch (error) {
    console.error("Error fetching daily summary:", error);
    fail(res, 500, "Failed to fetch daily summary.", "INTERNAL_ERROR");
  }
};

// POST /api/budget/allocate — save goal allocations as expenses
export const allocateSavings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { mode, allocations } = req.body;
    const todayStr = new Date().toISOString().split("T")[0];
    const todayStart = `${todayStr}T00:00:00Z`;
    const todayEnd = `${todayStr}T23:59:59Z`;

    if (!mode || !["manual", "auto"].includes(mode)) {
      fail(res, 400, "mode must be 'manual' or 'auto'.", "VALIDATION_ERROR");
      return;
    }

    // Load pending_savings + today's unclosed surplus
    const userResult = await pool.query(
      `SELECT pending_savings, last_closeout_date FROM users WHERE id = $1`,
      [userId]
    );
    const userRow = userResult.rows[0];
    const pendingSavings = parseFloat(userRow?.pending_savings ?? "0");

    // Calculate today's surplus only if not yet closed out today
    const lastCloseout = userRow?.last_closeout_date
      ? new Date(userRow.last_closeout_date).toISOString().split("T")[0]
      : null;
    let todaySurplus = 0;
    if (lastCloseout !== todayStr) {
      const budgetResult = await pool.query(
        `SELECT * FROM budgets WHERE user_id = $1 AND start_date <= $2 AND end_date >= $2 ORDER BY start_date DESC LIMIT 1`,
        [userId, todayStr]
      );
      if (budgetResult.rows.length > 0) {
        const budget = budgetResult.rows[0];
        const startDate = new Date(budget.start_date);
        const endDate = new Date(budget.end_date);
        const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const dailyBudget = parseFloat(budget.amount || budget.total_income) / totalDays;
        const spentResult = await pool.query(
          `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses
           WHERE user_id = $1 AND date >= $2 AND date <= $3 AND type = 'expense'`,
          [userId, todayStart, todayEnd]
        );
        const spent = parseFloat(spentResult.rows[0].total);
        todaySurplus = Math.max(0, parseFloat((dailyBudget - spent).toFixed(2)));
      }
    }

    const totalAvailable = parseFloat((pendingSavings + todaySurplus).toFixed(2));

    if (totalAvailable <= 0) {
      fail(res, 400, "No savings available to allocate.", "NO_SAVINGS");
      return;
    }

    let allocationPlan: { goalId: string; amount: number }[] = [];

    if (mode === "auto") {
      // Pick nearest-deadline active goal
      const goalResult = await pool.query(
        `SELECT id, title FROM savings_goals
         WHERE user_id = $1 AND deadline >= CURRENT_DATE
         ORDER BY deadline ASC LIMIT 1`,
        [userId]
      );
      if (goalResult.rows.length === 0) {
        fail(res, 400, "No active goals to allocate to.", "NO_GOALS");
        return;
      }
      allocationPlan = [{ goalId: goalResult.rows[0].id, amount: totalAvailable }];
    } else {
      if (!Array.isArray(allocations) || allocations.length === 0) {
        fail(res, 400, "allocations array is required for manual mode.", "VALIDATION_ERROR");
        return;
      }
      const totalRequested = allocations.reduce((sum: number, a: any) => sum + parseFloat(a.amount), 0);
      if (totalRequested > totalAvailable + 0.001) {
        fail(res, 400, `Cannot allocate ${totalRequested} — only ${totalAvailable} available.`, "INSUFFICIENT_SAVINGS");
        return;
      }
      allocationPlan = allocations.map((a: any) => ({ goalId: a.goalId, amount: parseFloat(a.amount) }));
    }

    // Validate all goalIds belong to this user
    const goalIds = allocationPlan.map(a => a.goalId);
    const goalCheck = await pool.query(
      `SELECT id, title FROM savings_goals WHERE user_id = $1 AND id = ANY($2::uuid[])`,
      [userId, goalIds]
    );
    if (goalCheck.rows.length !== goalIds.length) {
      fail(res, 400, "One or more goalIds are invalid.", "INVALID_GOAL");
      return;
    }
    const goalMap = new Map(goalCheck.rows.map((g: any) => [g.id, g.title]));

    // Insert allocation expenses
    const allocated: any[] = [];
    for (const item of allocationPlan) {
      const goalName = goalMap.get(item.goalId) ?? "Savings";
      const expResult = await pool.query(
        `INSERT INTO expenses (user_id, amount, category, tag, description, type, goal_id, confidence)
         VALUES ($1, $2, 'Savings', $3, $3, 'goal_allocation', $4, 100)
         RETURNING id`,
        [userId, item.amount, goalName, item.goalId]
      );
      allocated.push({
        goalId: item.goalId,
        goalName,
        amount: item.amount,
        expenseId: expResult.rows[0].id,
      });
    }

    const totalAllocated = allocated.reduce((s, a) => s + a.amount, 0);
    const newPendingSavings = parseFloat((totalAvailable - totalAllocated).toFixed(2));

    await pool.query(
      `UPDATE users SET pending_savings = $1, last_closeout_date = $2 WHERE id = $3`,
      [newPendingSavings, todayStr, userId]
    );

    if (userId) invalidateBudgetCache(userId);

    // Return refreshed goals
    const updatedGoalsResult = await pool.query(
      `SELECT
         g.id, g.title AS name, g.icon_key AS icon, g.target_amount, g.deadline,
         COALESCE(SUM(e.amount), 0) AS saved_amount
       FROM savings_goals g
       LEFT JOIN expenses e ON e.goal_id = g.id AND e.type = 'goal_allocation' AND e.user_id = $1
       WHERE g.user_id = $1 AND g.deadline >= CURRENT_DATE
       GROUP BY g.id ORDER BY g.deadline ASC`,
      [userId]
    );

    const today = new Date();
    const updatedGoals = updatedGoalsResult.rows.map((g: any) => {
      const targetAmount = parseFloat(g.target_amount);
      const savedAmount = parseFloat(g.saved_amount);
      const remaining = parseFloat((targetAmount - savedAmount).toFixed(2));
      const deadline = new Date(g.deadline);
      const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      return { id: g.id, name: g.name, icon: g.icon ?? "other", targetAmount, savedAmount, remaining, daysRemaining };
    });

    ok(res, { allocated, totalAllocated, updatedGoals });
  } catch (error) {
    console.error("Error allocating savings:", error);
    fail(res, 500, "Failed to allocate savings.", "INTERNAL_ERROR");
  }
};

// POST /api/budget/dismiss-closeout — roll surplus into pending_savings without allocating
export const dismissCloseout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const todayStr = new Date().toISOString().split("T")[0];
    const todayStart = `${todayStr}T00:00:00Z`;
    const todayEnd = `${todayStr}T23:59:59Z`;

    // Calculate today's surplus
    const budgetResult = await pool.query(
      `SELECT * FROM budgets WHERE user_id = $1 AND start_date <= $2 AND end_date >= $2 ORDER BY start_date DESC LIMIT 1`,
      [userId, todayStr]
    );

    let surplus = 0;
    if (budgetResult.rows.length > 0) {
      const budget = budgetResult.rows[0];
      const startDate = new Date(budget.start_date);
      const endDate = new Date(budget.end_date);
      const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const dailyBudget = parseFloat(budget.amount || budget.total_income) / totalDays;
      const spentResult = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses
         WHERE user_id = $1 AND date >= $2 AND date <= $3 AND type = 'expense'`,
        [userId, todayStart, todayEnd]
      );
      const spent = parseFloat(spentResult.rows[0].total);
      surplus = Math.max(0, parseFloat((dailyBudget - spent).toFixed(2)));
    }

    const updateResult = await pool.query(
      `UPDATE users
       SET pending_savings = COALESCE(pending_savings, 0) + $1,
           last_closeout_date = $2
       WHERE id = $3
       RETURNING pending_savings`,
      [surplus, todayStr, userId]
    );

    ok(res, { pendingSavings: parseFloat(updateResult.rows[0].pending_savings) });
  } catch (error) {
    console.error("Error dismissing closeout:", error);
    fail(res, 500, "Failed to dismiss closeout.", "INTERNAL_ERROR");
  }
};
