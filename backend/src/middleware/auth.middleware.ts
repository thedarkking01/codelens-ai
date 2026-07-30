import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { userRepository } from "../repositories/user.repository";
import { AppError } from "../utils/app-error";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(401, "Authorization header missing");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Invalid authorization format");
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyToken(token);

    const user = await userRepository.findById(payload.userId);

    if (!user) {
      throw new AppError(401, "User not found");
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}