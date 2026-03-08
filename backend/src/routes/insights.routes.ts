import { Router } from "express";
import { getHabits, getAnomalies, getForecast, getSubscriptions } from "../controllers/insights.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/forecast", authenticate, getForecast);
router.get("/habits", authenticate, getHabits);
router.get("/subscriptions", authenticate, getSubscriptions);
router.get("/anomalies", authenticate, getAnomalies);

export default router;
