import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";
import { ok, fail } from "../utils/response";

// Format "03 Mar 05:41" from a Date
const formatDatetime = (d: Date): string => {
  const day = String(d.getUTCDate()).padStart(2, "0");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mon = months[d.getUTCMonth()];
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${mon} ${hh}:${mm}`;
};

// GET /api/analytics/summary
export const getAnalyticsSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const todayStr = new Date().toISOString().split("T")[0];

    // Get current active budget
    const budgetResult = await pool.query(
      `SELECT * FROM budgets WHERE user_id = $1 AND start_date <= $2 AND end_date >= $2 ORDER BY start_date DESC LIMIT 1`,
      [userId, todayStr]
    );

    if (budgetResult.rows.length === 0) {
      fail(res, 404, "No active budget found.", "BUDGET_NOT_FOUND");
      return;
    }

    const budget = budgetResult.rows[0];
    const startDate = budget.start_date as string;
    const endDate = budget.end_date as string;
    const budgetAmount = parseFloat(budget.amount || budget.total_income);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date(todayStr);
    const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysElapsed = Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysLeft = Math.max(0, totalDays - daysElapsed + 1);

    // Fetch all real expenses for the budget period (exclude goal allocations)
    const expensesResult = await pool.query(
      `SELECT id, amount, category, COALESCE(tag, description) AS tag, date
       FROM expenses
       WHERE user_id = $1 AND date::date >= $2 AND date::date <= $3 AND type = 'expense'
       ORDER BY date ASC`,
      [userId, startDate, endDate]
    );

    const expenses = expensesResult.rows;
    const totalSpent = expenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);
    const percentUsed = budgetAmount > 0 ? parseFloat(((totalSpent / budgetAmount) * 100).toFixed(2)) : 0;

    // Min/max spend
    let minSpend = null;
    let maxSpend = null;
    for (const e of expenses) {
      const amt = parseFloat(e.amount);
      if (!minSpend || amt < minSpend.amount) {
        minSpend = { amount: amt, tag: e.tag ?? "", datetime: formatDatetime(new Date(e.date)) };
      }
      if (!maxSpend || amt > maxSpend.amount) {
        maxSpend = { amount: amt, tag: e.tag ?? "", datetime: formatDatetime(new Date(e.date)) };
      }
    }

    // Category breakdown
    const categories: Record<string, number> = {};
    for (const e of expenses) {
      categories[e.category] = (categories[e.category] || 0) + parseFloat(e.amount);
    }
    // Round to 2dp
    for (const k of Object.keys(categories)) {
      categories[k] = parseFloat(categories[k].toFixed(2));
    }

    // Weekly spend — Mon→Sun of current week
    const weeklySpend = [0, 0, 0, 0, 0, 0, 0]; // index 0 = Monday
    const todayObj = new Date();
    const dayOfWeek = todayObj.getDay(); // 0=Sun, 1=Mon...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(todayObj);
    monday.setDate(todayObj.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    for (const e of expenses) {
      const expDate = new Date(e.date);
      const diffDays = Math.floor((expDate.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 6) {
        weeklySpend[diffDays] += parseFloat(e.amount);
      }
    }
    const weeklySpendRounded = weeklySpend.map(v => parseFloat(v.toFixed(2)));

    // Calendar data — day-of-month → total spend
    const calendarData: Record<string, number> = {};
    for (const e of expenses) {
      const day = String(new Date(e.date).getUTCDate());
      calendarData[day] = (calendarData[day] || 0) + parseFloat(e.amount);
    }
    for (const k of Object.keys(calendarData)) {
      calendarData[k] = parseFloat(calendarData[k].toFixed(2));
    }

    ok(res, {
      budget: budgetAmount,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      daysLeft,
      totalDays,
      startDate,
      endDate,
      percentUsed,
      minSpend,
      maxSpend,
      totalCount: expenses.length,
      categories,
      weeklySpend: weeklySpendRounded,
      calendarData,
    });
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    fail(res, 500, "Failed to fetch analytics summary.", "INTERNAL_ERROR");
  }
};
