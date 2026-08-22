import { prisma } from "./config/prisma";

async function main() {
  const repositoryId = "cmt4lmuu90000ewvrtheb2zt1";

  const files = await prisma.file.findMany({
    where: {
      repositoryId,
    },
    select: {
      id: true,
      path: true,
      language: true,
    },
    orderBy: {
      path: "asc",
    },
  });

  console.log("\n==============================");
  console.log("Repository Files");
  console.log("==============================");

  console.log(`Total files: ${files.length}`);

  for (const file of files) {
    console.log(
      `${file.path} → ${file.language}`,
    );
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });