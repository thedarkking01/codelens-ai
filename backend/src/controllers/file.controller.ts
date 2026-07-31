import type { Request, Response, NextFunction } from "express";

import { fileService } from "../services/file.service";

export class FileController {
  async getRepositoryFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const repositoryId = String(req.params.repositoryId);

      const files = await fileService.getRepositoryFiles(repositoryId, userId);

      return res.status(200).json({
        success: true,
        data: files,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const repositoryId = String(req.params.repositoryId);

      const fileId = String(req.params.fileId);

      const file = await fileService.getFile(repositoryId, fileId, userId);

      return res.status(200).json({
        success: true,
        data: file,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const fileController = new FileController();
