import { Router } from "express";
import { purchaseAdvisor, chatInterface } from "../controllers/ai.controller";

const router = Router();

// POST /api/ai/purchase-advisor
router.post("/purchase-advisor", purchaseAdvisor);

// POST /api/ai/chat
router.post("/chat", chatInterface);

export default router;
