import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/auth.middleware";

// GET /api/expenses/trends
export const getExpenseTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const query = `
      SELECT date_trunc('week', date) as week, category, SUM(amount) as total
      FROM expenses
      WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '3 months'
      GROUP BY week, category
      ORDER BY week DESC;
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to fetch trends." });
  }
};

// GET /api/insights/habits
export const getHabits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const query = `
      SELECT category, description, amount, COUNT(*) as frequency
      FROM expenses 
      WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '2 months'
      GROUP BY category, description, amount 
      HAVING COUNT(*) >= 2
      ORDER BY frequency DESC;
    `;
    const result = await pool.query(query, [userId]);
    res.json({ habits: result.rows });
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to analyze habits." });
  }
};

// GET /api/insights/anomalies
export const getAnomalies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const query = `
      WITH past_avg AS (
        SELECT category, AVG(total_spent) as avg_monthly_spend
        FROM (
          SELECT category, date_trunc('month', date) as month, SUM(amount) as total_spent
          FROM expenses
          WHERE user_id = $1 AND date >= date_trunc('month', CURRENT_DATE) - INTERVAL '3 months' 
                AND date < date_trunc('month', CURRENT_DATE)
          GROUP BY category, month
        ) sub
        GROUP BY category
      ),
      current_spend AS (
        SELECT category, SUM(amount) as current_total
        FROM expenses
        WHERE user_id = $1 AND date >= date_trunc('month', CURRENT_DATE)
        GROUP BY category
      )
      SELECT c.category, c.current_total, p.avg_monthly_spend,
             ((c.current_total - p.avg_monthly_spend) / p.avg_monthly_spend * 100) as spike_percentage
      FROM current_spend c
      JOIN past_avg p ON c.category = p.category
      WHERE c.current_total > (p.avg_monthly_spend * 1.5);
    `;
    const result = await pool.query(query, [userId]);
    res.json({ anomalies: result.rows });
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to fetch anomalies." });
  }
};
