import { Router } from "express";
import { askQuestion } from "../controllers/chat.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, askQuestion);

export default router;