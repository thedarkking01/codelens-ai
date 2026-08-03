import { prisma } from "./config/prisma";
import { chunkingService } from "./services/chunking.service";

async function main() {
  // Get the latest repository
  const repository = await prisma.repository.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!repository) {
    throw new Error("No repository found.");
  }

  console.log("--------------------------------");
  console.log(`Repository : ${repository.name}`);
  console.log(`Status     : ${repository.status}`);
  console.log("--------------------------------");

  const result = await chunkingService.chunkRepository(
    repository.id,
  );

  console.log(`Files Processed : ${result.filesProcessed}`);
  console.log(`Chunks Created  : ${result.chunksCreated}`);

  const totalChunks = await prisma.chunk.count({
    where: {
      file: {
        repositoryId: repository.id,
      },
    },
  });

  console.log("--------------------------------");
  console.log(`Total Chunks in DB : ${totalChunks}`);
  console.log("--------------------------------");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });