import { Router } from "express";
import { chatMessage } from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/message", authenticate, chatMessage);

export default router;
