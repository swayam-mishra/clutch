import { Response } from "express";

export const ok = (res: Response, data: any, status = 200): void => {
  res.status(status).json({ success: true, data });
};

export const fail = (res: Response, status: number, message: string, code: string): void => {
  res.status(status).json({ success: false, error: message, code });
};
