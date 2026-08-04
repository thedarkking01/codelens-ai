import { randomUUID } from "crypto";

import { chunkRepository } from "../repositories/chunk.repository";
import { embeddingService } from "./embedding.service";
import {
  qdrantService,
  QdrantPoint,
} from "./qdrant.service";

export class RepositoryIndexingService {
  async indexRepository(repositoryId: string): Promise<void> {
    console.log(`🚀 Indexing repository ${repositoryId}`);

    await qdrantService.initializeCollection();

    const chunks =
      await chunkRepository.findByRepositoryId(repositoryId);

    if (chunks.length === 0) {
      console.log("No chunks found.");
      return;
    }

    console.log(`Found ${chunks.length} chunks.`);

    const texts = chunks.map((chunk) => chunk.content);

    console.log("Generating embeddings...");

    const embeddings =
      await embeddingService.generateEmbeddings(texts);

    console.log(`Generated ${embeddings.length} embeddings.`);

    const points: QdrantPoint[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const embeddingId = randomUUID();

      points.push({
        id: embeddingId,
        vector: embeddings[i],
        payload: {
          repositoryId,

          fileId: chunk.fileId,

          chunkId: chunk.id,

          chunkIndex: chunk.chunkIndex,

          filePath: chunk.file.path,

          language: chunk.file.language ?? "text",

          startLine: chunk.startLine,

          endLine: chunk.endLine,
        },
      });

      await chunkRepository.updateEmbeddingMetadata(
        chunk.id,
        embeddingId
      );
    }

    console.log("Uploading vectors to Qdrant...");

    await qdrantService.upsertPoints(points);

    console.log("✅ Repository indexed successfully.");
  }
}

export const repositoryIndexingService =
  new RepositoryIndexingService();