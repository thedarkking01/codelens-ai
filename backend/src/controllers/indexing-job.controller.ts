import { Request, Response, NextFunction } from "express";
import { indexingJobService } from "../services/indexing-job.service";

export class IndexingJobController {
  async getJobStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        res.status(400).json({ success: false, message: "Invalid indexing job ID" });
        return;
      }

      const userId = req.user!.id;

      const job =
        await indexingJobService.getJobById(
          id,
          userId,
        );

      return res.status(200).json({
        success: true,
        data: {
          id: job.id,
          repositoryId: job.repositoryId,
          repository: {
            id: job.repository.id,
            name: job.repository.name,
            githubUrl: job.repository.githubUrl,
            status: job.repository.status,
          },
          status: job.status,
          progress: job.progress,
          currentStep: job.currentStep,
          error: job.error,
          startedAt: job.startedAt,
          completedAt: job.completedAt,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const indexingJobController =
  new IndexingJobController();