import { Request, Response } from "express";
import pool from "../config/db";
import { supabase } from "../config/supabase";
import { AuthRequest } from "../middleware/auth.middleware";
import { ok, fail } from "../utils/response";

// POST /api/auth/signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      fail(res, 400, "name, email, and password are required.", "VALIDATION_ERROR");
      return;
    }
    if (password.length < 6) {
      fail(res, 400, "Password must be at least 6 characters.", "VALIDATION_ERROR");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("already in use") ||
          error.message.toLowerCase().includes("email already")) {
        fail(res, 400, "Email already in use", "EMAIL_TAKEN");
      } else {
        fail(res, 400, error.message, "SIGNUP_ERROR");
      }
      return;
    }

    const userId = data.user?.id;
    const profileResult = await pool.query(
      "SELECT name, email FROM users WHERE id = $1",
      [userId]
    );

    ok(res, {
      accessToken: data.session?.access_token ?? "",
      refreshToken: data.session?.refresh_token ?? "",
      user: {
        id: userId,
        name: profileResult.rows[0]?.name ?? name,
        email: profileResult.rows[0]?.email ?? email,
        hasBudget: false,
      },
    }, 201);
  } catch (error) {
    fail(res, 500, "Server error during signup.", "INTERNAL_ERROR");
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      fail(res, 401, "Invalid credentials", "INVALID_CREDENTIALS");
      return;
    }

    const userId = data.user?.id;

    const profileResult = await pool.query(
      "SELECT name, email FROM users WHERE id = $1",
      [userId]
    );

    const budgetResult = await pool.query(
      "SELECT 1 FROM budgets WHERE user_id = $1 LIMIT 1",
      [userId]
    );

    ok(res, {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: userId,
        name: profileResult.rows[0]?.name ?? data.user.email,
        email: profileResult.rows[0]?.email ?? data.user.email,
        hasBudget: budgetResult.rows.length > 0,
      },
    });
  } catch (error: any) {
    console.error("[login] caught exception:", error?.message ?? error);
    fail(res, 500, "Server error during login.", "INTERNAL_ERROR");
  }
};

// POST /api/auth/refresh
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      fail(res, 400, "refreshToken is required.", "VALIDATION_ERROR");
      return;
    }

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session) {
      fail(res, 401, "Invalid or expired refresh token.", "TOKEN_EXPIRED");
      return;
    }

    ok(res, { accessToken: data.session.access_token });
  } catch (error) {
    fail(res, 500, "Server error during token refresh.", "INTERNAL_ERROR");
  }
};

// POST /api/auth/logout
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    await supabase.auth.admin.signOut(token);
  }
  ok(res, {});
};
