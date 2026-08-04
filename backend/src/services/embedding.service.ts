import { geminiClient, EMBEDDING_MODEL } from "../config/gemini";

export class EmbeddingService {
  /**
   * Generate an embedding for a single text.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!text.trim()) {
      throw new Error("Cannot generate embedding for empty text.");
    }

    try {
      const response = await geminiClient.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
        config: {
          taskType: "RETRIEVAL_DOCUMENT",
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
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    try {
      const response = await geminiClient.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: texts,
        config: {
          taskType: "RETRIEVAL_DOCUMENT",
        },
      });

      if (!response.embeddings) {
        throw new Error("Gemini returned no embeddings.");
      }

      if (response.embeddings.length !== texts.length) {
        throw new Error(
          `Expected ${texts.length} embeddings but received ${response.embeddings.length}.`
        );
      }

      const embeddings: number[][] = [];

      for (let i = 0; i < response.embeddings.length; i++) {
        const values = response.embeddings[i].values;

        if (!values) {
          throw new Error(`Embedding at index ${i} has no values.`);
        }

        embeddings.push(values);
      }

      return embeddings;
    } catch (error) {
      console.error("Batch embedding generation failed:", error);
      throw error;
    }
  }
}

export const embeddingService = new EmbeddingService();