import { Router } from "express";
import { getProfile, updateProfile, updatePassword, updatePreferences } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.put("/password", authenticate, updatePassword);
router.put("/preferences", authenticate, updatePreferences);

export default router;
