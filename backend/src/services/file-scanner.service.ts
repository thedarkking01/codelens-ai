import fs from "fs/promises";
import path from "path";

export interface ScannedFile {
  path: string;
  name: string;
  extension: string | null;
  language: string | null;
  size: number;
  content: string;
}

export class FileScannerService {
  private readonly ignoredDirectories = new Set([
    ".git",
    "node_modules",
    "dist",
    "build",
    "coverage",
    ".next",
    ".nuxt",
    ".turbo",
    ".cache",
    "out",
    "target",
    "vendor",
    "__pycache__",
  ]);

  private readonly ignoredFiles = new Set([
    ".DS_Store",
    "Thumbs.db",
  ]);

  // Maximum size of a single file: 1 MB
  private readonly maxFileSize =
    1024 * 1024;

  // Maximum number of files indexed from one repository
  private readonly maxFileCount = 10_000;

  async scanRepository(
    repositoryPath: string,
  ): Promise<ScannedFile[]> {
    const files: ScannedFile[] = [];

    await this.scanDirectory(
      repositoryPath,
      repositoryPath,
      files,
    );

    return files;
  }

  private async scanDirectory(
    repositoryPath: string,
    currentPath: string,
    files: ScannedFile[],
  ): Promise<void> {
    // Stop scanning once the repository file limit is reached
    if (files.length >= this.maxFileCount) {
      console.warn(
        `⚠️ Maximum file limit reached: ${this.maxFileCount}`,
      );

      return;
    }

    const entries = await fs.readdir(
      currentPath,
      {
        withFileTypes: true,
      },
    );

    for (const entry of entries) {
      // Stop immediately when the limit is reached
      if (files.length >= this.maxFileCount) {
        console.warn(
          `⚠️ Maximum file limit reached: ${this.maxFileCount}`,
        );

        return;
      }

      const fullPath = path.join(
        currentPath,
        entry.name,
      );

      // Ignore unwanted directories
      if (
        entry.isDirectory() &&
        this.ignoredDirectories.has(entry.name)
      ) {
        continue;
      }

      // Ignore unwanted files
      if (
        entry.isFile() &&
        this.ignoredFiles.has(entry.name)
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.scanDirectory(
          repositoryPath,
          fullPath,
          files,
        );

        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const scannedFile =
        await this.processFile(
          repositoryPath,
          fullPath,
        );

      if (scannedFile) {
        files.push(scannedFile);
      }
    }
  }

  private async processFile(
    repositoryPath: string,
    filePath: string,
  ): Promise<ScannedFile | null> {
    try {
      const stats = await fs.stat(filePath);

      // Ignore files larger than 1 MB
      if (stats.size > this.maxFileSize) {
        console.log(
          `⏭️ Skipping large file: ${filePath}`,
        );

        return null;
      }

      const buffer = await fs.readFile(
        filePath,
      );

      // Ignore binary files
      if (this.isBinary(buffer)) {
        console.log(
          `⏭️ Skipping binary file: ${filePath}`,
        );

        return null;
      }

      const content =
        buffer.toString("utf-8");

      const relativePath = path
        .relative(repositoryPath, filePath)
        .split(path.sep)
        .join("/");

      const name =
        path.basename(filePath);

      const extension =
        this.getExtension(name);

      const language =
        this.detectLanguage(
          name,
          extension,
        );

      return {
        path: relativePath,
        name,
        extension,
        language,
        size: stats.size,
        content,
      };
    } catch (error) {
      console.warn(
        `⚠️ Could not process file: ${filePath}`,
        error,
      );

      return null;
    }
  }

  private getExtension(
    fileName: string,
  ): string | null {
    const extension =
      path.extname(fileName);

    if (!extension) {
      return null;
    }

    return extension
      .slice(1)
      .toLowerCase();
  }

  private detectLanguage(
    fileName: string,
    extension: string | null,
  ): string | null {
    const fileNameMap: Record<
      string,
      string
    > = {
      Dockerfile: "Dockerfile",
      Makefile: "Makefile",
      Jenkinsfile: "Jenkins",
    };

    if (fileNameMap[fileName]) {
      return fileNameMap[fileName];
    }

    if (!extension) {
      return null;
    }

    const languageMap: Record<
      string,
      string
    > = {
      ts: "TypeScript",
      tsx: "TypeScript React",
      js: "JavaScript",
      jsx: "JavaScript React",

      py: "Python",
      java: "Java",
      c: "C",
      h: "C",
      cpp: "C++",
      hpp: "C++",

      cs: "C#",
      go: "Go",
      rs: "Rust",
      php: "PHP",
      rb: "Ruby",
      swift: "Swift",
      kt: "Kotlin",
      kts: "Kotlin",

      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      sass: "Sass",
      less: "Less",

      json: "JSON",
      yaml: "YAML",
      yml: "YAML",
      xml: "XML",

      md: "Markdown",
      mdx: "MDX",

      sql: "SQL",
      sh: "Shell",
      bash: "Shell",
      zsh: "Shell",
      ps1: "PowerShell",

      prisma: "Prisma",
      graphql: "GraphQL",
    };

    return (
      languageMap[extension] ??
      null
    );
  }

  private isBinary(
    buffer: Buffer,
  ): boolean {
    const sampleSize =
      Math.min(
        buffer.length,
        8000,
      );

    for (
      let i = 0;
      i < sampleSize;
      i++
    ) {
      if (buffer[i] === 0) {
        return true;
      }
    }

    return false;
  }
}

export const fileScannerService =
  new FileScannerService();