import { Router } from "express";
import {
  getActiveChallenge,
  getAvailableChallenges,
  joinChallenge,
} from "../controllers/challenges.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/active", authenticate, getActiveChallenge);
router.get("/available", authenticate, getAvailableChallenges);
router.post("/:id/join", authenticate, joinChallenge);

export default router;
