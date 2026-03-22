import { Router } from "express";
import { createSplit, getSplits, settleSplit } from "../controllers/splits.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createSplit);
router.get("/", authenticate, getSplits);
router.put("/:id/settle", authenticate, settleSplit);

export default router;
