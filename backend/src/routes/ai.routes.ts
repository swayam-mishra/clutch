import { Router } from "express";
import { purchaseAdvisor, chatInterface } from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// POST /api/ai/purchase-advisor
router.post("/purchase-advisor", authenticate, purchaseAdvisor);

// POST /api/ai/chat
router.post("/chat", authenticate, chatInterface);

export default router;
