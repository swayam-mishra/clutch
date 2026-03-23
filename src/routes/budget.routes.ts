import { Router } from "express";
import { createOrUpdateBudget, getCurrentBudget } from "../controllers/budget.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createOrUpdateBudget);
router.get("/current", authenticate, getCurrentBudget);

export default router;
