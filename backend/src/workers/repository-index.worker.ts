import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { prisma } from "../config/prisma";
import {
  IndexingJobStatus,
  IndexingStep,
} from "../generated/prisma/enums";
import type { IndexingJobData } from "../queues/indexing.queue";
import { repositoryIngestionService } from "../services/repository-ingestion.service";
import { buildFileDependencies } from "../services/dependency.service";

async function updateIndexingJob(
  indexingJobId: string,
  progress: number,
  currentStep: IndexingStep,
) {
  await prisma.indexingJob.update({
    where: {
      id: indexingJobId,
    },
    data: {
      progress,
      currentStep,
    },
  });
}

async function analyzeRepositoryDependencies(
  repositoryId: string,
  indexingJobId: string,
) {
  await prisma.dependency.deleteMany({
    where: {
      sourceFile: {
        repositoryId,
      },
    },
  });

  const files = await prisma.file.findMany({
    where: {
      repositoryId,
    },
    select: {
      id: true,
      path: true,
    },
    orderBy: {
      path: "asc",
    },
  });

  console.log(
    `\n🔗 Dependency analysis started for ${files.length} files`,
  );

  if (files.length === 0) {
    console.log("No files found for dependency analysis.");
    return 0;
  }

  let processedFiles = 0;
  let totalDependencies = 0;

  for (const file of files) {
    const createdCount = await buildFileDependencies(file.id);

    totalDependencies += createdCount;
    processedFiles++;

    const progress = Math.min(
      89,
      60 + Math.floor((processedFiles / files.length) * 29),
    );

    await updateIndexingJob(
      indexingJobId,
      progress,
      IndexingStep.DEPENDENCY_ANALYSIS,
    );

    console.log(
      `🔗 ${processedFiles}/${files.length} | ${file.path} | dependencies: ${createdCount}`,
    );
  }

  console.log(
    `\n✅ Dependency analysis completed: ${totalDependencies} dependencies`,
  );

  return totalDependencies;
}

const worker = new Worker<IndexingJobData>(
  "repository-indexing",

  async (job) => {
    console.log("\n==============================");
    console.log("Processing indexing job");
    console.log("==============================");

    console.log("BullMQ Job ID:", job.id);
    console.log(
      "Repository ID:",
      job.data.repositoryId,
    );
    console.log(
      "Indexing Job ID:",
      job.data.indexingJobId,
    );

    const indexingJob =
      await prisma.indexingJob.findUnique({
        where: {
          id: job.data.indexingJobId,
        },
      });

    if (!indexingJob) {
      throw new Error(
        `IndexingJob ${job.data.indexingJobId} not found`,
      );
    }

    try {
      // ==========================================
      // STEP 1 - Mark Job PROCESSING
      // ==========================================

      await prisma.indexingJob.update({
        where: {
          id: indexingJob.id,
        },
        data: {
          status: IndexingJobStatus.PROCESSING,
          progress: 0,
          currentStep: IndexingStep.CLONING,
          startedAt:
            indexingJob.startedAt ??
            new Date(),
          error: null,
          completedAt: null,
        },
      });

      await job.updateProgress(0);

      console.log(
        "IndexingJob marked as PROCESSING",
      );

      // ==========================================
      // STEP 2 - Run Repository Ingestion
      // ==========================================

      await repositoryIngestionService.ingest(
        job.data.repositoryId,
        job.data.githubUrl,

        async (progress, step) => {
          console.log(
            `📊 Progress: ${progress}% | Step: ${step}`,
          );

          await updateIndexingJob(
            indexingJob.id,
            progress,
            step,
          );

          await job.updateProgress(progress);
        },
      );

      // ==========================================
      // STEP 3 - Dependency Analysis
      // ==========================================

      await updateIndexingJob(
        indexingJob.id,
        60,
        IndexingStep.DEPENDENCY_ANALYSIS,
      );

      await job.updateProgress(60);

      console.log("\n🔗 Starting dependency analysis...");

      const dependencyCount =
        await analyzeRepositoryDependencies(
          job.data.repositoryId,
          indexingJob.id,
        );

      console.log(
        `🔗 Total dependencies discovered: ${dependencyCount}`,
      );

      // ==========================================
      // STEP 4 - Mark COMPLETED
      // ==========================================

      await prisma.indexingJob.update({
        where: {
          id: indexingJob.id,
        },
        data: {
          status:
            IndexingJobStatus.COMPLETED,
          progress: 100,
          currentStep: IndexingStep.INDEXING,
          completedAt: new Date(),
          error: null,
        },
      });

      await job.updateProgress(100);

      console.log(
        "IndexingJob marked as COMPLETED",
      );

      return {
        success: true,
        indexingJobId: indexingJob.id,
      };
    } catch (error) {
      // ==========================================
      // FAILURE HANDLING
      // ==========================================

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown indexing error";

      console.error(
        "\n❌ Repository indexing failed:",
      );

      console.error(errorMessage);

      await prisma.indexingJob.update({
        where: {
          id: indexingJob.id,
        },
        data: {
          status: IndexingJobStatus.FAILED,
          error: errorMessage,
          completedAt: new Date(),
        },
      });

      console.error(
        "IndexingJob marked as FAILED",
      );

      // IMPORTANT:
      // Rethrow so BullMQ knows the job failed.
      throw error;
    }
  },

  {
    connection: redisConnection,
  },
);

// ==========================================
// BullMQ EVENTS
// ==========================================

worker.on("completed", (job, result) => {
  console.log("\n🎉 BullMQ job completed:");

  console.log({
    jobId: job.id,
    result,
  });
});

worker.on("failed", (job, error) => {
  console.error(
    "\n❌ BullMQ job failed:",
  );

  console.error({
    jobId: job?.id,
    error: error.message,
  });
});

worker.on("error", (error) => {
  console.error(
    "\n❌ BullMQ worker error:",
    error,
  );
});

console.log(
  "Repository indexing worker started...",
);