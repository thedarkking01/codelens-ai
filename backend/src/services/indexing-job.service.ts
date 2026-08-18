import { AppError } from "../utils/app-error";
import { indexingJobRepository } from "../repositories/indexing-job.repository";

export class IndexingJobService {
  async getJobById(
    indexingJobId: string,
    userId: string,
  ) {
    const job =
      await indexingJobRepository.findByIdAndUserId(
        indexingJobId,
        userId,
      );

    if (!job) {
      throw new AppError(
        404,
        "Indexing job not found",
      );
    }

    return job;
  }
}

export const indexingJobService =
  new IndexingJobService();