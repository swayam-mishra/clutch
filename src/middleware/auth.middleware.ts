import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";
import { fail } from "../utils/response";

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  // DEBUG — remove after diagnosing
  console.log(`[auth] ${req.method} ${req.path} | Authorization: ${req.headers.authorization ?? "MISSING"}`);

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("[auth] REJECTED — no token extracted from Authorization header");
    fail(res, 401, "Access denied. No token provided.", "TOKEN_INVALID");
    return;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log("[auth] REJECTED — supabase.auth.getUser failed:", error?.message ?? "no user returned");
      fail(res, 401, "Invalid or expired token.", "TOKEN_EXPIRED");
      return;
    }

    req.user = { id: user.id };
    next();
  } catch (error: any) {
    console.log("[auth] REJECTED — exception:", error?.message ?? error);
    fail(res, 500, "Internal auth error.", "INTERNAL_ERROR");
  }
};
