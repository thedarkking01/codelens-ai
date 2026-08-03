import { repositoryRepository } from "../repositories/repository.repository";
import { fileRepository } from "../repositories/file.repository";
import { repositoryImportService } from "./repository-import.service";
import { fileScannerService } from "./file-scanner.service";
import { AppError } from "../utils/app-error";
import { chunkingService } from "./chunking.service";

export class RepositoryIngestionService {
  async ingest(
    repositoryId: string,
    githubUrl: string,
  ): Promise<void> {
    try {
      // 1. Mark repository as CLONING
      await repositoryRepository.updateStatus(
        repositoryId,
        "CLONING",
      );

      // 2. Clone repository
      const localPath =
        await repositoryImportService.cloneRepository(
          repositoryId,
          githubUrl,
        );

      // 3. Save local path
      await repositoryRepository.updateLocalPath(
        repositoryId,
        localPath,
      );

      // 4. Mark as SCANNING
      await repositoryRepository.updateStatus(
        repositoryId,
        "SCANNING",
      );

      // 5. Scan repository
      const scannedFiles =
        await fileScannerService.scanRepository(
          localPath,
        );

      // 6. Convert scanner results to database format
      const files = scannedFiles.map((file) => ({
        repositoryId,
        path: file.path,
        name: file.name,
        extension: file.extension,
        language: file.language,
        size: file.size,
        content: file.content,
      }));

      // 7. Save files
      await fileRepository.createMany(files);

      await repositoryRepository.updateStatus(
      repositoryId,
      "CHUNKING",
      );

      const result =
        await chunkingService.chunkRepository(repositoryId);

      console.log(
        `📦 Chunks created: ${result.chunksCreated}`,
      );

      // 8. Mark repository as READY
      await repositoryRepository.updateStatus(
        repositoryId,
        "READY",
      );

      console.log(
        `✅ Repository ${repositoryId} ingestion completed.`,
      );

      console.log(
        `📊 Files indexed: ${files.length}`,
      );
    } catch (error) {
      console.error(
        `❌ Repository ${repositoryId} ingestion failed:`,
        error,
      );

      // Mark repository as FAILED
      try {
        await repositoryRepository.updateStatus(
          repositoryId,
          "FAILED",
        );
      } catch (statusError) {
        console.error(
          "Failed to update repository status:",
          statusError,
        );
      }

      throw new AppError(
        500,
        "Repository ingestion failed",
      );
    }
  }
}

export const repositoryIngestionService =
  new RepositoryIngestionService();