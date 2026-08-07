import { geminiClient, EMBEDDING_MODEL } from "../config/gemini";

export type EmbeddingTaskType =
  | "RETRIEVAL_DOCUMENT"
  | "RETRIEVAL_QUERY";

const MAX_BATCH_SIZE = 100;

export class EmbeddingService {
  /**
   * Generate an embedding for a single text.
   */
  async generateEmbedding(
    text: string,
    taskType: EmbeddingTaskType = "RETRIEVAL_DOCUMENT"
  ): Promise<number[]> {
    if (!text.trim()) {
      throw new Error("Cannot generate embedding for empty text.");
    }

    try {
      const response = await geminiClient.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
        config: {
          taskType,
        },
      });

      const embedding = response.embeddings?.[0]?.values;

      if (!embedding) {
        throw new Error("Gemini returned an empty embedding.");
      }

      return embedding;
    } catch (error) {
      console.error("Embedding generation failed:", error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts.
   *
   * Gemini allows a maximum of 100 texts per embedding request,
   * so larger inputs are automatically split into batches.
   */
  async generateEmbeddings(
    texts: string[],
    taskType: EmbeddingTaskType = "RETRIEVAL_DOCUMENT"
  ): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const allEmbeddings: number[][] = [];

    try {
      for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
        const batch = texts.slice(i, i + MAX_BATCH_SIZE);

        console.log(
          `Generating embeddings: ${i + 1}-${i + batch.length} of ${texts.length}`
        );

        const response = await geminiClient.models.embedContent({
          model: EMBEDDING_MODEL,
          contents: batch,
          config: {
            taskType,
          },
        });

        if (!response.embeddings) {
          throw new Error("Gemini returned no embeddings.");
        }

        if (response.embeddings.length !== batch.length) {
          throw new Error(
            `Expected ${batch.length} embeddings but received ${response.embeddings.length}.`
          );
        }

        for (let j = 0; j < response.embeddings.length; j++) {
          const values = response.embeddings[j].values;

          if (!values) {
            throw new Error(
              `Embedding at batch index ${j} has no values.`
            );
          }

          allEmbeddings.push(values);
        }
      }

      if (allEmbeddings.length !== texts.length) {
        throw new Error(
          `Expected ${texts.length} total embeddings but received ${allEmbeddings.length}.`
        );
      }

      console.log(
        `Successfully generated ${allEmbeddings.length} embeddings.`
      );

      return allEmbeddings;
    } catch (error) {
      console.error("Batch embedding generation failed:", error);
      throw error;
    }
  }
}

export const embeddingService = new EmbeddingService();