import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import {
  JsonWebTokenError,
  TokenExpiredError,
} from "jsonwebtoken";
import { AppError } from "../utils/app-error";

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      errors: err.flatten(),
    });
  }

  // Application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Expired JWT
  if (err instanceof TokenExpiredError) {
    return res.status(401).json({
      success: false,
      message: "Authentication token has expired",
    });
  }

  // Invalid / malformed JWT
  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }

  // Unknown errors
  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
