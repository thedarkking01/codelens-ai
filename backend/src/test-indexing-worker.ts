import { prisma } from "./config/prisma";
import { IndexingJobStatus } from "./generated/prisma/enums";
import { indexingQueue } from "./queues/indexing.queue";

async function main() {
  const repository = await prisma.repository.findFirst();

  if (!repository) {
    throw new Error("No repository found.");
  }

  console.log("Repository found:");
  console.log({
    id: repository.id,
    name: repository.name,
  });

  const indexingJob = await prisma.indexingJob.create({
    data: {
      repositoryId: repository.id,
      status: IndexingJobStatus.QUEUED,
      progress: 0,
    },
  });

  console.log("\nPostgreSQL IndexingJob created:");
  console.log({
    id: indexingJob.id,
    repositoryId: indexingJob.repositoryId,
    status: indexingJob.status,
  });

  const queueJob = await indexingQueue.add("index-repository", {
    repositoryId: repository.id,
    indexingJobId: indexingJob.id,
    githubUrl: repository.githubUrl,
  });

  console.log("\nBullMQ job added:");
  console.log({
    id: queueJob.id,
    name: queueJob.name,
    data: queueJob.data,
  });

  await indexingQueue.close();
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("Test failed:", error);

  await prisma.$disconnect();

  process.exit(1);
});