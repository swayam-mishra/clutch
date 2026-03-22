import { Router } from "express";
import { register, login, getMe, logout, updateMe } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);

export default router;
