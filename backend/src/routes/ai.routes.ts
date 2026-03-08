import { Router } from "express";
import { purchaseAdvisor, chatInterface, getWeeklyReview, getWeeklyReviewHistory } from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/purchase-advisor", authenticate, purchaseAdvisor);
router.post("/chat", authenticate, chatInterface);
router.get("/weekly-review", authenticate, getWeeklyReview);
router.get("/weekly-review/history", authenticate, getWeeklyReviewHistory);

export default router;
