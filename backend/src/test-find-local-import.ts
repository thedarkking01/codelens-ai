import { prisma } from "./config/prisma";
import { parseDependencies } from "./parsers/dependency.parser";

async function main() {
  const files = await prisma.file.findMany({
    where: {
      path: {
        endsWith: ".ts",
      },
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

  console.log(`Found ${files.length} TypeScript files`);

  for (const file of files) {
    const dependencies = parseDependencies(
      file.content,
      file.language,
    );

    const localDependencies = dependencies.filter(
      (dependency) =>
        dependency.importPath.startsWith("."),
    );

    if (localDependencies.length > 0) {
      console.log("\n==============================");
      console.log("Found local imports");
      console.log("==============================");

      console.log("Source:");
      console.log(file.path);

      console.log("\nImports:");

      for (const dependency of localDependencies) {
        console.log(
          `  ${dependency.importPath}`,
        );
      }

      return;
    }
  }

  console.log("\nNo TypeScript file with local imports found.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });