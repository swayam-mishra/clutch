import { Router } from "express";
import { getHabits, getAnomalies } from "../controllers/insights.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/habits", authenticate, getHabits);
router.get("/anomalies", authenticate, getAnomalies);

export default router;
