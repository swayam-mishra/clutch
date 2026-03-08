import { Router } from "express";
import { getLatestScore, getScoreHistory } from "../controllers/healthScore.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getLatestScore);
router.get("/history", authenticate, getScoreHistory);

export default router;
