import { Request, Response, NextFunction } from "express";
import { chatSchema } from "../validators/chat.validator";
import { chatService } from "../services/chat.service";

export const askQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
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