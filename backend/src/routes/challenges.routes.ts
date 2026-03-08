import { Router } from "express";
import {
  getActiveChallenge,
  getAvailableChallenges,
  joinChallenge,
  updateProgress,
  getChallengeHistory,
} from "../controllers/challenges.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/active", authenticate, getActiveChallenge);
router.get("/available", authenticate, getAvailableChallenges);
router.get("/history", authenticate, getChallengeHistory);
router.post("/:id/join", authenticate, joinChallenge);
router.put("/:id/progress", authenticate, updateProgress);

export default router;
