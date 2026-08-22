import path from "path";
import { prisma } from "../config/prisma";

const TYPESCRIPT_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
];

const PYTHON_EXTENSIONS = [
  ".py",
];

export async function resolveDependency(
  sourceFileId: string,
  importPath: string,
): Promise<string | null> {
  const sourceFile = await prisma.file.findUnique({
    where: {
      id: sourceFileId,
    },
  });

  if (!sourceFile) {
    return null;
  }

  // External packages such as "express"
  // are not repository files.
  if (
    !importPath.startsWith(".") &&
    !importPath.startsWith("/")
  ) {
    return null;
  }

  const sourceDirectory = path.posix.dirname(sourceFile.path);

  const normalizedPath = path.posix.normalize(
    path.posix.join(sourceDirectory, importPath),
  );

  const candidates = buildCandidates(
    normalizedPath,
    sourceFile.language,
  );

  const targetFile = await prisma.file.findFirst({
    where: {
      repositoryId: sourceFile.repositoryId,
      path: {
        in: candidates,
      },
    },
  });

  return targetFile?.id ?? null;
}

function buildCandidates(
  filePath: string,
  language?: string | null,
): string[] {
  const candidates = new Set<string>();

  candidates.add(filePath);

  const extensions =
    language?.toLowerCase() === "python"
      ? [".py"]
      : [".ts", ".tsx", ".js", ".jsx"];

  // Normal extension resolution
  for (const extension of extensions) {
    candidates.add(`${filePath}${extension}`);
  }

  // index file resolution
  for (const extension of extensions) {
    candidates.add(
      path.posix.join(filePath, `index${extension}`),
    );
  }

  // TypeScript projects commonly import .js
  // while the actual source file is .ts/.tsx.
  if (
    filePath.endsWith(".js") ||
    filePath.endsWith(".jsx")
  ) {
    const withoutExtension = filePath.replace(
      /\.(js|jsx)$/,
      "",
    );

    candidates.add(`${withoutExtension}.ts`);
    candidates.add(`${withoutExtension}.tsx`);
  }

  return Array.from(candidates);
}