import { repositoryRepository } from "../repositories/repository.repository";
import { fileRepository } from "../repositories/file.repository";
import { repositoryImportService } from "./repository-import.service";
import { fileScannerService } from "./file-scanner.service";
import { chunkingService } from "./chunking.service";
import { repositoryIndexingService } from "./repository-indexing.service";
import { AppError } from "../utils/app-error";
import {
  IndexingStep,
} from "../generated/prisma/enums";

type ProgressCallback = (
  progress: number,
  step: IndexingStep,
) => Promise<void>;

export class RepositoryIngestionService {
  async ingest(
    repositoryId: string,
    githubUrl: string,
    onProgress?: ProgressCallback,
  ): Promise<void> {
    try {
      console.log(
        `🚀 Starting ingestion for repository ${repositoryId}`,
      );

      // ==========================================
      // STEP 1 - Clone Repository
      // ==========================================

      await repositoryRepository.updateStatus(
        repositoryId,
        "CLONING",
      );

      await onProgress?.(
        10,
        IndexingStep.CLONING,
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
      // STEP 2 - Scan Files
      // ==========================================

      await repositoryRepository.updateStatus(
        repositoryId,
        "SCANNING",
      );

      await onProgress?.(
        30,
        IndexingStep.SCANNING,
      );

      console.log("📂 Scanning repository...");

      const scannedFiles =
        await fileScannerService.scanRepository(
          localPath,
        );

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

      console.log(
        `📄 Files scanned: ${files.length}`,
      );

      // ==========================================
      // STEP 3 - Chunk Files
      // ==========================================

      await repositoryRepository.updateStatus(
        repositoryId,
        "CHUNKING",
      );

      await onProgress?.(
        50,
        IndexingStep.CHUNKING,
      );

      console.log("✂️ Chunking files...");

      const chunkResult =
        await chunkingService.chunkRepository(
          repositoryId,
        );

      console.log(
        `📦 Chunks created: ${chunkResult.chunksCreated}`,
      );

      // ==========================================
      // STEP 4 - Generate Embeddings
      // ==========================================

      await repositoryRepository.updateStatus(
        repositoryId,
        "EMBEDDING",
      );

      await onProgress?.(
        70,
        IndexingStep.EMBEDDING,
      );

      console.log(
        "🧠 Generating embeddings...",
      );

      await repositoryIndexingService.indexRepository(
        repositoryId,
      );

      // ==========================================
      // STEP 5 - Indexing Complete
      // ==========================================

      await onProgress?.(
        90,
        IndexingStep.INDEXING,
      );

      // ==========================================
      // STEP 6 - Repository Ready
      // ==========================================

      await repositoryRepository.updateStatus(
        repositoryId,
        "READY",
      );

      console.log("");
      console.log(
        "🎉 Repository ingestion completed!",
      );
      console.log(
        "------------------------------------",
      );
      console.log(
        `Repository ID : ${repositoryId}`,
      );
      console.log(
        `Files Indexed : ${files.length}`,
      );
      console.log(
        `Chunks Created: ${chunkResult.chunksCreated}`,
      );
      console.log("Status        : READY");
      console.log("AI Search     : ENABLED");
      console.log(
        "------------------------------------",
      );
    } catch (error) {
      console.error(
        "Repository ingestion failed:",
        error,
      );

      await repositoryRepository.updateStatus(
        repositoryId,
        "FAILED",
      );

      throw error;
    }
  }
}

export const repositoryIngestionService =
  new RepositoryIngestionService();