import { Router } from "express";
import { getLatestScore } from "../controllers/healthScore.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/score", authenticate, getLatestScore);

export default router;
