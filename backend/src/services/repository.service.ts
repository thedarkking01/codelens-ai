import { AppError } from "../utils/app-error";
import { repositoryRepository } from "../repositories/repository.repository";
import { repositoryIngestionService } from "./repository-ingestion.service";
import type { CreateRepositoryInput } from "../validators/repository.validator";

export class RepositoryService {
  async createRepository(userId: string, data: CreateRepositoryInput) {
    const repositoryName = this.extractRepositoryName(data.githubUrl);

    // 1. Create repository record
    const repository = await repositoryRepository.create({
      name: repositoryName,
      githubUrl: data.githubUrl,
      user: {
        connect: {
          id: userId,
        },
      },
    });

    // 2. Start repository ingestion
    // We intentionally don't await this.
    // The API should not wait for cloning/scanning.
    void repositoryIngestionService
      .ingest(repository.id, repository.githubUrl)
      .catch((error) => {
        console.error(
          `Repository ingestion failed for ${repository.id}:`,
          error,
        );
      });

    // 3. Immediately return repository
    return repository;
  }

  async getRepositories(userId: string) {
    return repositoryRepository.findAllByUserId(userId);
  }

  async getRepository(repositoryId: string, userId: string) {
    const repository = await repositoryRepository.findByIdAndUserId(
      repositoryId,
      userId,
    );

    if (!repository) {
      throw new AppError(404, "Repository not found");
    }

    return repository;
  }

  async deleteRepository(repositoryId: string, userId: string) {
    const repository = await repositoryRepository.findByIdAndUserId(
      repositoryId,
      userId,
    );

    if (!repository) {
      throw new AppError(404, "Repository not found");
    }

    return repositoryRepository.delete(repository.id);
  }
  async getRepositoryStatus(repositoryId: string, userId: string) {
    const repository = await repositoryRepository.findByIdAndUserId(
      repositoryId,
      userId,
    );

    if (!repository) {
      throw new AppError(404, "Repository not found");
    }

    return {
      id: repository.id,
      status: repository.status,
    //   localPath: repository.localPath,
      updatedAt: repository.updatedAt,
    };
  }

  private extractRepositoryName(githubUrl: string): string {
    const url = new URL(githubUrl);

    const pathParts = url.pathname.split("/").filter(Boolean);

    if (pathParts.length < 2) {
      throw new AppError(400, "Invalid GitHub repository URL");
    }

    return pathParts[1].replace(/\.git$/, "");
  }
}

export const repositoryService = new RepositoryService();
