import { Router } from "express";
import { getWeeklyReview } from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Internal/worker route — not part of the frontend spec
router.get("/weekly-review", authenticate, getWeeklyReview);

export default router;
