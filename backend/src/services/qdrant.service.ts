import { QdrantClient } from "@qdrant/js-client-rest";
import { COLLECTION_NAME, qdrantClient } from "../config/qdrant";

export interface QdrantPointPayload 
  extends Record<string, unknown>{
  repositoryId: string;
  fileId: string;
  chunkId: string;
  chunkIndex: number;
  filePath: string;
  language: string;
  startLine: number;
  endLine: number;
}

export interface QdrantPoint {
  id: string;
  vector: number[];
  payload: QdrantPointPayload;
}

export class QdrantService {
  constructor(private readonly client: QdrantClient = qdrantClient) {}

  async initializeCollection(): Promise<void> {
    const collections = await this.client.getCollections();

    const exists = collections.collections.some(
      (collection) => collection.name === COLLECTION_NAME
    );

    if (exists) {
      return;
    }

    await this.client.createCollection(COLLECTION_NAME, {
        vectors: {
            size: 3072,
            distance: "Cosine",
        },
    });

    console.log(`✅ Qdrant collection "${COLLECTION_NAME}" created.`);
  }

  async upsertPoints(points: QdrantPoint[]): Promise<void> {
    if (points.length === 0) {
      return;
    }

    await this.client.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });
  }

  async deleteRepositoryVectors(repositoryId: string): Promise<void> {
    await this.client.delete(COLLECTION_NAME, {
      wait: true,
      filter: {
        must: [
          {
            key: "repositoryId",
            match: {
              value: repositoryId,
            },
          },
        ],
      },
    });
  }

  async search(vector: number[], limit = 10) {
    return this.client.query(COLLECTION_NAME, {
      query: vector,
      limit,
    });
  }
}

export const qdrantService = new QdrantService();