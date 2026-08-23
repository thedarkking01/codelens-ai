import { prisma } from "./config/prisma";
import { resolveDependency } from "./services/dependency-resolver.service";

async function main() {
  const repositoryId = "cmt4lmuu90000ewvrtheb2zt1";

  const sourceFile = await prisma.file.findFirst({
    where: {
      repositoryId,
      path: "Rock_paper_scissor/main.py",
    },
  });

  if (!sourceFile) {
    console.log("Source file not found.");
    return;
  }

  console.log("Source:");
  console.log(sourceFile.path);

  const imports = [
    "game_logic",
    "player",
    "computer",
  ];

  for (const importPath of imports) {
    const result = await resolveDependency(
      sourceFile.id,
      importPath,
    );

    console.log(
        `\n${importPath} →`,
        result ?? "NOT RESOLVED",
    );
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });