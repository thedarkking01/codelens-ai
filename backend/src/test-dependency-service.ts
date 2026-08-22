import { prisma } from "./config/prisma";
import { buildFileDependencies } from "./services/dependency.service";

async function main() {
  const file = await prisma.file.findFirst({
    where: {
      path: "backend/src/app.ts",
    },
  });

  if (!file) {
    console.log("Target test file not found.");
    return;
  }

  console.log("Source file:");
  console.log(file.path);

  console.log("\nSource content:");
  console.log(file.content);

  const createdCount = await buildFileDependencies(file.id);

  console.log("\nDependencies processed:");
  console.log(createdCount);

  const dependencies = await prisma.dependency.findMany({
    where: {
      sourceFileId: file.id,
    },
    include: {
      targetFile: {
        select: {
          id: true,
          path: true,
        },
      },
    },
  });

  console.log("\nStored dependencies:");
  console.dir(dependencies, { depth: null });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });