import { Router } from "express";
import { analyzeAdvisor } from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/analyze", authenticate, analyzeAdvisor);

export default router;
