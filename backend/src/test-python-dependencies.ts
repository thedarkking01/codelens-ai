import { prisma } from "./config/prisma";
import { parseDependencies } from "./parsers/dependency.parser";

async function main() {
  const repositoryId = "cmt4lmuu90000ewvrtheb2zt1";

  const files = await prisma.file.findMany({
    where: {
      repositoryId,
      language: "Python",
    },
    select: {
      id: true,
      path: true,
      content: true,
      language: true,
    },
    orderBy: {
      path: "asc",
    },
  });

  console.log(
    `Found ${files.length} Python files`,
  );

  for (const file of files) {
    const dependencies = parseDependencies(
      file.content,
      file.language,
    );

    if (dependencies.length > 0) {
      console.log("\n==============================");
      console.log("Python imports found");
      console.log("==============================");

      console.log("Source:");
      console.log(file.path);

      console.log("\nImports:");

      for (const dependency of dependencies) {
        console.log(
          `  ${dependency.importPath} → ${dependency.type}`,
        );
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });