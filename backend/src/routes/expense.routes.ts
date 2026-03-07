import { Router } from "express";
import {
  createExpense,
  getExpenses,
  getExpenseSummary,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller";
import { authenticate } from "../middleware/auth.middleware";
import { getExpenseTrends } from "../controllers/insights.controller";

const router = Router();

// GET /api/expenses/summary and /trends must come before /api/expenses/:id
router.get("/summary", authenticate, getExpenseSummary);
router.get("/trends", authenticate, getExpenseTrends);

router.get("/", authenticate, getExpenses);
router.post("/", authenticate, createExpense);
router.get("/:id", authenticate, getExpenseById);
router.put("/:id", authenticate, updateExpense);
router.delete("/:id", authenticate, deleteExpense);

export default router;
