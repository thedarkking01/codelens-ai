import { prisma } from "./config/prisma";
import { buildFileDependencies } from "./services/dependency.service";

const REPO_ID = "cmtkcft2r00004svrwgjogo3y";

async function main() {
  // 1. Delete existing (stale) dependencies for this repo
  const deleted = await prisma.dependency.deleteMany({
    where: { sourceFile: { repositoryId: REPO_ID } },
  });
  console.log(`Deleted ${deleted.count} stale dependencies`);

  // 2. Get all files for this repo
  const files = await prisma.file.findMany({
    where: { repositoryId: REPO_ID },
    select: { id: true, path: true, language: true },
  });
  console.log(`Found ${files.length} files — rebuilding dependencies...\n`);

  let total = 0;

  for (const file of files) {
    const count = await buildFileDependencies(file.id);
    if (count > 0) {
      console.log(`  ${file.path} → ${count} dependencies`);
      total += count;
    }
  }

  console.log(`\nTotal dependencies created: ${total}`);

  // 3. Verify
  const deps = await prisma.dependency.findMany({
    where: { sourceFile: { repositoryId: REPO_ID } },
    include: {
      sourceFile: { select: { path: true } },
      targetFile: { select: { path: true } },
    },
  });

  console.log("\nFinal dependency graph:");
  for (const d of deps) {
    console.log(`  ${d.sourceFile.path} -> ${d.targetFile.path}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
