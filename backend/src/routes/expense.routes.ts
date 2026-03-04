import { Router } from "express";
import {
  createExpense,
  getExpenses,
  getExpenseSummary,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller";

const router = Router();

// GET /api/expenses/summary must come before /api/expenses/:id
router.get("/summary", getExpenseSummary);

router.get("/", getExpenses);
router.post("/", createExpense);
router.get("/:id", getExpenseById);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
