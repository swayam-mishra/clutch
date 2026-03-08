import { Router } from "express";
import { registerToken, getSettings, updateSettings } from "../controllers/notifications.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", authenticate, registerToken);
router.get("/settings", authenticate, getSettings);
router.put("/settings", authenticate, updateSettings);

export default router;
