import { chunkRepository } from "../repositories/chunk.repository";
import { AppError } from "../utils/app-error";

export class ChunkService {
  async getChunksByFile(fileId: string) {
    return chunkRepository.findByFileId(fileId);
  }

  async getChunkById(chunkId: string) {
    const chunk = await chunkRepository.findById(chunkId);

    if (!chunk) {
      throw new AppError(404, "Chunk not found");
    }

    return chunk;
  }
}

export const chunkService = new ChunkService();