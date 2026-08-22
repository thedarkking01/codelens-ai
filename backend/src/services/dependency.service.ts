import { prisma } from "../config/prisma";
import {
  parseDependencies,
  ParsedDependency,
} from "../parsers/dependency.parser";
import { resolveDependency } from "./dependency-resolver.service";

export async function buildFileDependencies(
  fileId: string,
): Promise<number> {
  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
  });

  if (!file) {
    throw new Error(`File not found: ${fileId}`);
  }

  const parsedDependencies = parseDependencies(
    file.content,
    file.language,
  );

  let createdCount = 0;

  for (const dependency of parsedDependencies) {
    const targetFileId = await resolveDependency(
      file.id,
      dependency.importPath,
    );

    // Ignore external dependencies.
    if (!targetFileId) {
      continue;
    }

    // Don't create self-dependencies.
    if (targetFileId === file.id) {
      continue;
    }

    await prisma.dependency.upsert({
      where: {
        sourceFileId_targetFileId_type: {
          sourceFileId: file.id,
          targetFileId,
          type: dependency.type,
        },
      },
      update: {},
      create: {
        sourceFileId: file.id,
        targetFileId,
        type: dependency.type,
      },
    });

    createdCount++;
  }

  return createdCount;
}