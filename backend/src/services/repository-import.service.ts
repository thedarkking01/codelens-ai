import { simpleGit } from "simple-git";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { AppError } from "../utils/app-error";

export class RepositoryImportService {
  private readonly basePath = path.resolve(
    process.cwd(),
    "uploads",
    "repositories",
  );

  async cloneRepository(
    repositoryId: string,
    githubUrl: string,
  ): Promise<string> {
    const repositoryPath = path.join(
      this.basePath,
      repositoryId,
    );

    try {
      await fs.mkdir(this.basePath, {
        recursive: true,
      });

      const git = simpleGit();

      await git.clone(
        githubUrl,
        repositoryPath,
        ["--depth", "1"],
      );

      return repositoryPath;
    } catch (error) {
      await fs.rm(repositoryPath, {
        recursive: true,
        force: true,
      });

      console.error(
        `Failed to clone repository ${repositoryId}`,
        error,
      );

      throw new AppError(
        500,
        "Failed to clone GitHub repository",
      );
    }
  }
}

export const repositoryImportService =
  new RepositoryImportService();