import { Router } from "express";
import {
  createExpense,
  getExpenses,
  categorizeExpense,
  deleteExpense,
} from "../controllers/expense.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// /categorize must come before /:id
router.post("/categorize", authenticate, categorizeExpense);
router.post("/", authenticate, createExpense);
router.get("/", authenticate, getExpenses);
router.delete("/:id", authenticate, deleteExpense);

export default router;
