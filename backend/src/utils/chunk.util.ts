import { ChunkData } from "../types/chunk.types";

const DEFAULT_CHUNK_SIZE = 120;
const DEFAULT_OVERLAP = 20;

export function splitIntoChunks(
  content: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  overlap: number = DEFAULT_OVERLAP
): ChunkData[] {
  const lines = content.split("\n");

  if (lines.length === 0) {
    return [];
  }

  const chunks: ChunkData[] = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < lines.length) {
    const end = Math.min(start + chunkSize, lines.length);

    chunks.push({
      chunkIndex,
      startLine: start + 1,
      endLine: end,
      content: lines.slice(start, end).join("\n"),
    });

    if (end === lines.length) {
      break;
    }

    start += chunkSize - overlap;
    chunkIndex++;
  }

  return chunks;
}