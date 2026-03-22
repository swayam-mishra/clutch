import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: true, message: "Access denied. No token provided." });
    return;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(403).json({ error: true, message: "Invalid or expired token." });
      return;
    }

    req.user = { id: user.id };
    next();
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal auth error." });
  }
};
