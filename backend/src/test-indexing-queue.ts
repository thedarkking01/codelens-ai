import { indexingQueue } from "./queues/indexing.queue";

async function main() {
  const job = await indexingQueue.add("index-repository", {
    repositoryId: "test-repository-id",
    indexingJobId: "test-indexing-job-id",
  });

  console.log("BullMQ job created:");
  console.log({
    id: job.id,
    name: job.name,
    data: job.data,
  });

  await indexingQueue.close();
}

main().catch((error) => {
  console.error("Queue test failed:", error);
  process.exit(1);
});