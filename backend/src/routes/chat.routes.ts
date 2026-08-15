import { Router } from "express";
import {
  askQuestion,
  createSession,
  getSessions,
  getMessages,
  sendMessage,
  deleteSession,
} from "../controllers/chat.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// =========================================================
// PHASE 6 — Single Question RAG
// =========================================================

router.post(
  "/",
  authMiddleware,
  askQuestion,
);

// =========================================================
// PHASE 7 — Conversational Chat
// =========================================================

router.post(
  "/sessions",
  authMiddleware,
  createSession,
);

router.get(
  "/sessions",
  authMiddleware,
  getSessions,
);

router.get(
  "/sessions/:sessionId/messages",
  authMiddleware,
  getMessages,
);

router.post(
  "/sessions/:sessionId/messages",
  authMiddleware,
  sendMessage,
);

router.delete(
  "/sessions/:sessionId",
  authMiddleware,
  deleteSession,
);

export default router;