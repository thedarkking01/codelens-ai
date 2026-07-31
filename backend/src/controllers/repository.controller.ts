import type { Request, Response, NextFunction } from "express";
import { repositoryService } from "../services/repository.service";
import { createRepositorySchema } from "../validators/repository.validator";
import { AppError } from "../utils/app-error";

export class RepositoryController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const data = createRepositorySchema.parse(req.body);

      const repository = await repositoryService.createRepository(userId, data);

      return res.status(201).json({
        success: true,
        data: repository,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const repositories = await repositoryService.getRepositories(userId);

      return res.status(200).json({
        success: true,
        data: repositories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const repositoryId = req.params.id;

      if (typeof repositoryId !== "string") {
        throw new AppError(400, "Invalid repository ID");
      }

      const repository = await repositoryService.getRepository(
        repositoryId,
        userId,
      );

      return res.status(200).json({
        success: true,
        data: repository,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const repositoryId = req.params.id;

      if (typeof repositoryId !== "string") {
        throw new AppError(400, "Invalid repository ID");
      }

      await repositoryService.deleteRepository(repositoryId, userId);

      return res.status(200).json({
        success: true,
        message: "Repository deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const repositoryId = String(req.params.id);

      const repository = await repositoryService.getRepositoryStatus(
        repositoryId,
        userId,
      );

      return res.status(200).json({
        success: true,
        data: repository,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const repositoryController = new RepositoryController();
