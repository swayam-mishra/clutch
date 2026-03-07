import { Router } from "express";
import { getLatestScore, getScoreHistory } from "../controllers/healthScore.controller";

const router = Router();

router.get("/", getLatestScore);
router.get("/history", getScoreHistory);

export default router;
