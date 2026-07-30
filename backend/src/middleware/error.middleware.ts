import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      errors: err.flatten(),
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}