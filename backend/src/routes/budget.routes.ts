import { Router } from "express";
import {
  createOrUpdateBudget,
  getBudgetByMonth,
  getBudgetStatus,
} from "../controllers/budget.controller";

const router = Router();

router.post("/", createOrUpdateBudget);
// :month/status must come before :month
router.get("/:month/status", getBudgetStatus);
router.get("/:month", getBudgetByMonth);

export default router;
