import { Router } from "express";
import { getGoals, createGoal, updateGoal } from "../controllers/goals.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getGoals);
router.post("/", authenticate, createGoal);
router.put("/:id", authenticate, updateGoal);

export default router;
