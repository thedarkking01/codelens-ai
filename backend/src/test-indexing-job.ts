import "dotenv/config";

import { prisma } from "./config/prisma";
import { IndexingJobStatus, IndexingStep } from "./generated/prisma/enums";

async function main() {
  const repository = await prisma.repository.findFirst();

  if (!repository) {
    console.log("No repository found.");
    return;
  }

  const job = await prisma.indexingJob.create({
    data: {
      repositoryId: repository.id,
      status: IndexingJobStatus.QUEUED,
      progress: 0,
    },
  });

  console.log("Created indexing job:");
  console.log(job);

  const updatedJob = await prisma.indexingJob.update({
    where: {
      id: job.id,
    },
    data: {
      status: IndexingJobStatus.PROCESSING,
      progress: 25,
      currentStep: IndexingStep.SCANNING,
      startedAt: new Date(),
    },
  });

  console.log("\nUpdated indexing job:");
  console.log(updatedJob);

  const jobs = await prisma.indexingJob.findMany({
    where: {
      repositoryId: repository.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log("\nRepository indexing jobs:");
  console.log(jobs);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });