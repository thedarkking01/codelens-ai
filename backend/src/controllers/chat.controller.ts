import { Request, Response, NextFunction } from "express";
import {
  chatSchema,
  createChatSessionSchema,
  sendChatMessageSchema,
} from "../validators/chat.validator";
import { chatService } from "../services/chat.service";

// =========================================================
// PHASE 6 — Single Question RAG
// =========================================================

export const askQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = chatSchema.parse(req.body);

    const response = await chatService.askQuestion(data);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PHASE 7 — Create Chat Session
// =========================================================

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { repositoryId } =
      createChatSessionSchema.parse(req.body);

    const session = await chatService.createSession(
      req.user!.id,
      repositoryId,
    );

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PHASE 7 — Get User Chat Sessions
// =========================================================

export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sessions =
      await chatService.getUserSessions(
        req.user!.id,
      );

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PHASE 7 — Get Chat Messages
// =========================================================

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sessionId = req.params.sessionId as string;

    const messages =
      await chatService.getMessages(
        req.user!.id,
        sessionId,
      );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PHASE 7 — Send Chat Message
// =========================================================

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { message } =
      sendChatMessageSchema.parse(req.body);

    const sessionId = req.params.sessionId as string;

    const response =
      await chatService.sendMessage(
        req.user!.id,
        sessionId,
        message,
      );

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PHASE 7 — Delete Chat Session
// =========================================================

export const deleteSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sessionId = req.params.sessionId as string;

    await chatService.deleteSession(
      req.user!.id,
      sessionId,
    );

    res.status(200).json({
      success: true,
      message: "Chat session deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};