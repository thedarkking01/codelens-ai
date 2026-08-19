import { simpleGit } from "simple-git";
import path from "path";
import fs from "fs/promises";
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
      // Make sure the parent directory exists
      await fs.mkdir(this.basePath, {
        recursive: true,
      });

      // Defensive validation
      if (!githubUrl || typeof githubUrl !== "string") {
        throw new AppError(
          400,
          "GitHub repository URL is required",
        );
      }

      if (
        !repositoryId ||
        typeof repositoryId !== "string"
      ) {
        throw new AppError(
          400,
          "Repository ID is required",
        );
      }

      console.log(
        `🔗 GitHub URL: ${githubUrl}`,
      );

      console.log(
        `📁 Clone destination: ${repositoryPath}`,
      );

      const git = simpleGit();

      await git.clone(
        githubUrl,
        repositoryPath,
        {
          "--depth": "1",
        },
      );

      console.log(
        `✅ Repository cloned successfully`,
      );

      console.log(
        `📁 Local path: ${repositoryPath}`,
      );

      return repositoryPath;
    } catch (error) {
      await fs.rm(repositoryPath, {
        recursive: true,
        force: true,
      });

      console.error(
        `❌ Failed to clone repository ${repositoryId}`,
        error,
      );

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        500,
        "Failed to clone GitHub repository",
      );
    }
  }
}

export const repositoryImportService =
  new RepositoryImportService();