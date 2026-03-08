import { Router } from "express";
import {
  createOrUpdateBudget,
  getBudgetByMonth,
  getBudgetStatus,
} from "../controllers/budget.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createOrUpdateBudget);
// :month/status must come before :month
router.get("/:month/status", authenticate, getBudgetStatus);
router.get("/:month", authenticate, getBudgetByMonth);

export default router;
