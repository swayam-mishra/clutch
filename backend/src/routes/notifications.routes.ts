import { Router } from "express";
import { updatePreferences } from "../controllers/notifications.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.patch("/preferences", authenticate, updatePreferences);

export default router;
