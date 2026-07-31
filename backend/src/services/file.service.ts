import { AppError } from "../utils/app-error";
import { repositoryRepository } from "../repositories/repository.repository";
import { fileRepository } from "../repositories/file.repository";

export class FileService {
  async getRepositoryFiles(repositoryId: string, userId: string) {
    const repository = await repositoryRepository.findByIdAndUserId(
      repositoryId,
      userId,
    );

    if (!repository) {
      throw new AppError(404, "Repository not found");
    }

    const files = await fileRepository.findAllByRepositoryId(repositoryId);

    return files.map((file) => ({
      id: file.id,
      path: file.path,
      name: file.name,
      extension: file.extension,
      language: file.language,
      size: file.size,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    }));
  }

  async getFile(repositoryId: string, fileId: string, userId: string) {
    const repository = await repositoryRepository.findByIdAndUserId(
      repositoryId,
      userId,
    );

    if (!repository) {
      throw new AppError(404, "Repository not found");
    }

    const file = await fileRepository.findByIdAndRepositoryId(
      fileId,
      repositoryId,
    );

    if (!file) {
      throw new AppError(404, "File not found");
    }

    return {
      id: file.id,
      path: file.path,
      name: file.name,
      extension: file.extension,
      language: file.language,
      size: file.size,
      content: file.content,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }
}

export const fileService = new FileService();
