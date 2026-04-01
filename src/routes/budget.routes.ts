import { Router } from "express";
import { createOrUpdateBudget, getCurrentBudget, getDailySummary, allocateSavings, dismissCloseout } from "../controllers/budget.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createOrUpdateBudget);
router.get("/current", authenticate, getCurrentBudget);
router.get("/daily-summary", authenticate, getDailySummary);
router.post("/allocate", authenticate, allocateSavings);
router.post("/dismiss-closeout", authenticate, dismissCloseout);

export default router;
