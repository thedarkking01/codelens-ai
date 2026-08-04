import { QdrantClient } from "@qdrant/js-client-rest";

const url = process.env.QDRANT_URL;

if (!url) {
  throw new Error("QDRANT_URL is not configured.");
}

export const qdrantClient = new QdrantClient({
  url,
  apiKey: process.env.QDRANT_API_KEY || undefined,
});

export const COLLECTION_NAME =
  process.env.QDRANT_COLLECTION || "repository_chunks";