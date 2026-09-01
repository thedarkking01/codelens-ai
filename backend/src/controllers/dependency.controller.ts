import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { getRepositoryDependencies } from "../services/dependency.service";
import { repositoryRepository } from "../repositories/repository.repository";

export async function getDependencies(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.id;
    const repositoryId = String(req.params.repositoryId);

    if (!repositoryId) {
      throw new AppError(400, "Invalid repository ID");
    }

    const repository = await repositoryRepository.findByIdAndUserId(
      repositoryId,
      userId,
    );

    if (!repository) {
      throw new AppError(404, "Repository not found");
    }

    const dependencies = await getRepositoryDependencies(repositoryId);

    return res.status(200).json({
      success: true,
      data: dependencies,
    });
  } catch (error) {
    next(error);
  }
}
