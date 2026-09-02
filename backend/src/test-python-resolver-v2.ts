import { prisma } from "./config/prisma";
import { resolveDependency } from "./services/dependency-resolver.service";

const REPO_ID = "cmtkbyvfb00002svrac2nc1cj";

async function main() {
  const cases: { source: string; importPath: string; expected: string }[] = [
    { source: "src/main.py",    importPath: ".api",     expected: "src/api.py" },
    { source: "src/main.py",    importPath: ".models",  expected: "src/models.py" },
    { source: "src/api.py",     importPath: ".models",  expected: "src/models.py" },
    { source: "src/api.py",     importPath: ".storage", expected: "src/storage.py" },
    { source: "src/storage.py", importPath: ".models",  expected: "src/models.py" },
  ];

  for (const { source, importPath, expected } of cases) {
    const sourceFile = await prisma.file.findFirst({
      where: { repositoryId: REPO_ID, path: source },
    });

    if (!sourceFile) {
      console.log(`❌ Source file not found: ${source}`);
      continue;
    }

    const resolvedId = await resolveDependency(sourceFile.id, importPath);

    const resolvedFile = resolvedId
      ? await prisma.file.findUnique({ where: { id: resolvedId } })
      : null;

    const ok = resolvedFile?.path === expected;
    console.log(
      `${ok ? "✅" : "❌"} ${source} + "${importPath}" → ${resolvedFile?.path ?? "NOT RESOLVED"} (expected: ${expected})`,
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
