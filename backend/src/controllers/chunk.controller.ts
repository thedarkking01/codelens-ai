import { Request, Response, NextFunction } from "express";
import { chunkService } from "../services/chunk.service";

export class ChunkController {
  async getChunksByFile(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const fileId = Array.isArray(req.params.fileId)
        ? req.params.fileId[0]
        : req.params.fileId;

      const chunks = await chunkService.getChunksByFile(fileId);

      res.status(200).json({
        success: true,
        data: chunks,
      });
    } catch (error) {
      next(error);
    }
  }

  async getChunkById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const chunkId = Array.isArray(req.params.chunkId)
        ? req.params.chunkId[0]
        : req.params.chunkId;

      const chunk = await chunkService.getChunkById(chunkId);

      res.status(200).json({
        success: true,
        data: chunk,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const chunkController = new ChunkController();