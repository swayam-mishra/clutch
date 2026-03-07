import { Router } from "express";
import { contributeToGoal } from "../controllers/goals.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.patch("/:id/contribute", authenticate, contributeToGoal);

export default router;
