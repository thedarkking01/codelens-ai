import { chunkRepository } from "../repositories/chunk.repository";
import { fileRepository } from "../repositories/file.repository";
import { splitIntoChunks } from "../utils/chunk.util";

type FileForChunking = {
  id: string;
  content: string;
};

export class ChunkingService {
  /**
   * Chunk a single file and save its chunks.
   */
  async chunkFile(file: FileForChunking): Promise<number> {
    // Remove old chunks first
    await chunkRepository.deleteByFileId(file.id);
    
    const chunks = splitIntoChunks(file.content);

    if (chunks.length === 0) {
      return 0;
    }

    const chunkData = chunks.map((chunk) => ({
      fileId: file.id,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
    }));

    await chunkRepository.createMany(chunkData);

    return chunks.length;
  }

  /**
   * Chunk every file in a repository.
   */
  async chunkRepository(repositoryId: string) {
    const files =
      await fileRepository.findByRepositoryId(repositoryId);

    let totalChunks = 0;

    for (const file of files) {
      totalChunks += await this.chunkFile({
        id: file.id,
        content: file.content,
      });
    }

    return {
      filesProcessed: files.length,
      chunksCreated: totalChunks,
    };
  }
}

export const chunkingService = new ChunkingService();