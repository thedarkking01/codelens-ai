import path from "path";

export interface ParsedDependency {
  importPath: string;
  type: "IMPORT";
}

export function parseDependencies(
  content: string,
  language?: string | null,
): ParsedDependency[] {
  if (!language) {
    return [];
  }

  const normalizedLanguage = language.toLowerCase();

  if (
    normalizedLanguage === "typescript" ||
    normalizedLanguage === "javascript" ||
    normalizedLanguage === "tsx" ||
    normalizedLanguage === "jsx"
  ) {
    return parseJavaScriptDependencies(content);
  }

  if (normalizedLanguage === "python") {
    return parsePythonDependencies(content);
  }

  return [];
}

function parseJavaScriptDependencies(
  content: string,
): ParsedDependency[] {
  const dependencies: ParsedDependency[] = [];

  const importRegex =
    /import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;

  const requireRegex =
    /require\s*\(\s*["']([^"']+)["']\s*\)/g;

  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    dependencies.push({
      importPath: match[1],
      type: "IMPORT",
    });
  }

  while ((match = requireRegex.exec(content)) !== null) {
    dependencies.push({
      importPath: match[1],
      type: "IMPORT",
    });
  }

  return dependencies;
}

function parsePythonDependencies(
  content: string,
): ParsedDependency[] {
  const dependencies: ParsedDependency[] = [];

  const importRegex =
    /^\s*import\s+([a-zA-Z_][\w.]*)/gm;

  const fromRegex =
    /^\s*from\s+(\.+[a-zA-Z_][\w.]*|[a-zA-Z_][\w.]*)\s+import\s+/gm;

  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    dependencies.push({
      importPath: match[1],
      type: "IMPORT",
    });
  }

  while ((match = fromRegex.exec(content)) !== null) {
    dependencies.push({
      importPath: match[1],
      type: "IMPORT",
    });
  }

  return dependencies;
}