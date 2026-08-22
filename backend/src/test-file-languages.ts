import { prisma } from "./config/prisma";

async function main() {
  const files = await prisma.file.findMany({
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
  console.log("Stored File Languages");
  console.log("==============================");

  for (const file of files) {
    console.log(
      `${file.path} → language=${file.language ?? "NULL"}`,
    );
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });