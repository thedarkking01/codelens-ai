import { splitIntoChunks } from "./utils/chunk.util";

const content = Array.from(
  { length: 350 },
  (_, i) => `Line ${i + 1}`
).join("\n");

const chunks = splitIntoChunks(content);

console.log(`Total chunks: ${chunks.length}`);

chunks.forEach((chunk) => {
  console.log(
    `Chunk ${chunk.chunkIndex}: ${chunk.startLine}-${chunk.endLine}`
  );
});