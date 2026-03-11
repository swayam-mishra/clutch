import { Request, Response } from "express";
import pool from "../config/db";
import { supabase } from "../config/supabase";
import { AuthRequest } from "../middleware/auth.middleware";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Supabase handles hashing and the DB insert via the on_auth_user_created trigger
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name } // maps to raw_user_meta_data in the trigger
      }
    });

    if (error) {
      res.status(400).json({ error: true, message: error.message });
      return;
    }

    res.status(201).json({ user: data.user, session: data.session });
  } catch (error) {
    res.status(500).json({ error: true, message: "Server error during registration." });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({ error: true, message: "Invalid credentials." });
      return;
    }

    // data.session.access_token is what the frontend sends in the Bearer header
    res.json({ user: data.user, token: data.session.access_token, refresh_token: data.session.refresh_token });
  } catch (error) {
    res.status(500).json({ error: true, message: "Server error during login." });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, monthly_income, currency FROM users WHERE id = $1",
      [req.user?.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to fetch user." });
  }
};

// POST /api/auth/logout
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    await supabase.auth.admin.signOut(token); // Invalidates the token server-side
  }
  res.json({ message: "Logged out successfully." });
};

// PUT /api/auth/me
export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, monthlyIncome, currency } = req.body;

    const query = `
      UPDATE users 
      SET name = COALESCE($1, name), 
          monthly_income = COALESCE($2, monthly_income), 
          currency = COALESCE($3, currency)
      WHERE id = $4
      RETURNING id, name, email, monthly_income, currency;
    `;

    const result = await pool.query(query, [name, monthlyIncome, currency, userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to update profile." });
  }
};
