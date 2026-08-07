import { embeddingService } from "./embedding.service.js";
import { qdrantService } from "./qdrant.service.js";
import { chunkRepository } from "../repositories/chunk.repository.js";

export interface SearchResult {
  score: number;
  chunkId: string;
  filePath: string;
  language: string;
  startLine: number;
  endLine: number;
  content: string;
}

export class SearchService {
  async searchRepository(repositoryId: string, query: string, limit?: number) {
    const topK = limit ?? Number(process.env.SEARCH_TOP_K ?? 5);

    const minScore = Number(process.env.SEARCH_MIN_SCORE ?? 0.5);
    // Step 1: Generate embedding
    const embedding = await embeddingService.generateEmbedding(
      query,
      "RETRIEVAL_QUERY",
    );

    // Step 2: Search Qdrant
    const searchResult = await qdrantService.searchRepository(
      repositoryId,
      embedding,
      topK,
    );

    const points = (searchResult.points ?? []).filter(
      (point) => (point.score ?? 0) >= minScore,
    );

    if (points.length === 0) {
      return {
        query,
        totalResults: 0,
        results: [],
      };
    }

    // Step 3: Load chunk content from PostgreSQL
    const chunkIds = points
      .map((point) => point.payload?.chunkId)
      .filter((id): id is string => typeof id === "string");

    const chunks = await chunkRepository.findByIds(chunkIds);

    const chunkMap = new Map(chunks.map((chunk) => [chunk.id, chunk]));

    // Step 4: Merge Qdrant metadata with PostgreSQL content
    const results: SearchResult[] = [];

    for (const point of points) {
      const payload = point.payload;

      if (!payload) continue;

      const chunkId = payload.chunkId as string;

      const chunk = chunkMap.get(chunkId);

      if (!chunk) continue;

      results.push({
        score: point.score ?? 0,
        chunkId,
        filePath: payload.filePath as string,
        language: payload.language as string,
        startLine: payload.startLine as number,
        endLine: payload.endLine as number,
        content: chunk.content,
      });
    }

    // Step 5: Sort by similarity score
    results.sort((a, b) => b.score - a.score);

    return {
      query,
      totalResults: results.length,
      results,
    };
  }
}

export const searchService = new SearchService();
