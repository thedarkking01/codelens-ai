import { randomUUID } from "crypto";

import { chunkRepository } from "../repositories/chunk.repository";
import { embeddingService } from "./embedding.service";
import {
  qdrantService,
  QdrantPoint,
} from "./qdrant.service";

const EMBEDDING_BATCH_SIZE = 100;

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

    /*
     * Only process chunks that have not already been embedded.
     *
     * This makes repository indexing resumable.
     */
    const pendingChunks = chunks.filter(
      (chunk) => !chunk.embeddingId
    );

    console.log(
      `🧩 Pending embeddings: ${pendingChunks.length}`
    );

    if (pendingChunks.length === 0) {
      console.log(
        "✅ All chunks already have embeddings. Nothing to index."
      );
      return;
    }

    /*
     * Gemini allows a maximum of 100 embedding requests
     * in a single batch.
     */
    for (
      let start = 0;
      start < pendingChunks.length;
      start += EMBEDDING_BATCH_SIZE
    ) {
      const batch = pendingChunks.slice(
        start,
        start + EMBEDDING_BATCH_SIZE
      );

      const batchNumber =
        Math.floor(start / EMBEDDING_BATCH_SIZE) + 1;

      const totalBatches = Math.ceil(
        pendingChunks.length / EMBEDDING_BATCH_SIZE
      );

      console.log(
        `\n📦 Processing batch ${batchNumber}/${totalBatches}`
      );

      console.log(
        `Generating embeddings: ${start + 1}-${start + batch.length} of ${pendingChunks.length}`
      );

      const texts = batch.map(
        (chunk) => chunk.content
      );

      try {
        /*
         * Generate embeddings for this batch only.
         */
        const embeddings =
          await embeddingService.generateEmbeddings(
            texts,
            "RETRIEVAL_DOCUMENT"
          );

        console.log(
          `Generated ${embeddings.length} embeddings.`
        );

        const points: QdrantPoint[] = [];

        /*
         * Create Qdrant points for this batch.
         */
        for (let i = 0; i < batch.length; i++) {
          const chunk = batch[i];
          const embedding = embeddings[i];

          if (!embedding) {
            throw new Error(
              `Missing embedding for chunk ${chunk.id}`
            );
          }

          const embeddingId = randomUUID();

          points.push({
            id: embeddingId,
            vector: embedding,
            payload: {
              repositoryId,

              fileId: chunk.fileId,

              chunkId: chunk.id,

              chunkIndex: chunk.chunkIndex,

              filePath: chunk.file.path,

              language:
                chunk.file.language ?? "text",

              startLine: chunk.startLine,

              endLine: chunk.endLine,
            },
          });
        }

        /*
         * Upload the batch to Qdrant.
         */
        console.log(
          `Uploading ${points.length} vectors to Qdrant...`
        );

        await qdrantService.upsertPoints(points);

        /*
         * Only mark chunks as embedded AFTER
         * Qdrant successfully receives the vectors.
         */
        for (let i = 0; i < batch.length; i++) {
          const chunk = batch[i];
          const point = points[i];

          await chunkRepository.updateEmbeddingMetadata(
            chunk.id,
            point.id
          );
        }

        console.log(
          `✅ Batch ${batchNumber}/${totalBatches} completed.`
        );
      } catch (error) {
        console.error(
          `❌ Batch ${batchNumber}/${totalBatches} failed.`
        );

        /*
         * Important:
         *
         * Do not mark failed chunks as embedded.
         * This allows the indexing process to resume later.
         */
        throw error;
      }
    }

    console.log(
      `\n🎉 Repository ${repositoryId} indexed successfully.`
    );
  }
}

export const repositoryIndexingService =
  new RepositoryIndexingService();