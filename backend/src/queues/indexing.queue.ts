import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export interface IndexingJobData {
  repositoryId: string;
  indexingJobId: string;
  githubUrl: string;
}

export const indexingQueue = new Queue<IndexingJobData>(
  "repository-indexing",
  {
    connection: redisConnection,
  }
);