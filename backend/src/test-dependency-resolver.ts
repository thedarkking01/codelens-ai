import {prisma} from "./config/prisma";
import { resolveDependency } from "./services/dependency-resolver.service";

async function main() {
  const sourceFile = await prisma.file.findFirst({
    where: {
      path: {
        contains: "src/",
      },
    },
  });

  if (!sourceFile) {
    console.log("No source file found.");
    return;
  }

  console.log("Source file:");
  console.log(sourceFile.path);

  const result = await resolveDependency(
    sourceFile.id,
    "../services/auth.service",
  );

  console.log("\nResolved target:");
  console.log(result);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });