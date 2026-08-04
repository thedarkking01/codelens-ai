import { repositoryRepository } from "../repositories/repository.repository";
import { fileRepository } from "../repositories/file.repository";
import { repositoryImportService } from "./repository-import.service";
import { fileScannerService } from "./file-scanner.service";
import { chunkingService } from "./chunking.service";
import { repositoryIndexingService } from "./repository-indexing.service";
import { AppError } from "../utils/app-error";

export class RepositoryIngestionService {
  async ingest(
    repositoryId: string,
    githubUrl: string,
  ): Promise<void> {
    try {
      console.log(`🚀 Starting ingestion for repository ${repositoryId}`);

      // ==========================================
      // Step 1 - Clone Repository
      // ==========================================
      await repositoryRepository.updateStatus(
        repositoryId,
        "CLONING",
      );

      console.log("📥 Cloning repository...");

      const localPath =
        await repositoryImportService.cloneRepository(
          repositoryId,
          githubUrl,
        );

      await repositoryRepository.updateLocalPath(
        repositoryId,
        localPath,
      );

      // ==========================================
      // Step 2 - Scan Files
      // ==========================================
      await repositoryRepository.updateStatus(
        repositoryId,
        "SCANNING",
      );

      console.log("📂 Scanning repository...");

      const scannedFiles =
        await fileScannerService.scanRepository(localPath);

      const files = scannedFiles.map((file) => ({
        repositoryId,
        path: file.path,
        name: file.name,
        extension: file.extension,
        language: file.language,
        size: file.size,
        content: file.content,
      }));

      await fileRepository.createMany(files);

      console.log(`📄 Files scanned: ${files.length}`);

      // ==========================================
      // Step 3 - Chunk Files
      // ==========================================
      await repositoryRepository.updateStatus(
        repositoryId,
        "CHUNKING",
      );

      console.log("✂️ Chunking files...");

      const chunkResult =
        await chunkingService.chunkRepository(repositoryId);

      console.log(
        `📦 Chunks created: ${chunkResult.chunksCreated}`,
      );

      // ==========================================
      // Step 4 - Generate Embeddings
      // ==========================================
      await repositoryRepository.updateStatus(
        repositoryId,
        "EMBEDDING",
      );

      console.log("🧠 Generating embeddings...");

      await repositoryIndexingService.indexRepository(
        repositoryId,
      );

      // ==========================================
      // Step 5 - Repository Ready
      // ==========================================
      await repositoryRepository.updateStatus(
        repositoryId,
        "READY",
      );

      console.log("");
      console.log("🎉 Repository ingestion completed!");
      console.log("------------------------------------");
      console.log(`Repository ID : ${repositoryId}`);
      console.log(`Files Indexed : ${files.length}`);
      console.log(`Chunks Created: ${chunkResult.chunksCreated}`);
      console.log("Status        : READY");
      console.log("AI Search     : ENABLED");
      console.log("------------------------------------");

    } catch (error) {
      console.error(
        `❌ Repository ${repositoryId} ingestion failed:`,
        error,
      );

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

      if (error instanceof AppError) {
        throw error;
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