import "dotenv/config";

import { embeddingService } from "./services/embedding.service";

async function main() {
  const text = `
function add(a: number, b: number) {
  return a + b;
}
`;

  console.log("Generating embedding...");

  const embedding = await embeddingService.generateEmbedding(text);

  console.log("✅ Embedding generated");
  console.log("Dimension:", embedding.length);
  console.log("First 10 values:");
  console.log(embedding.slice(0, 10));
}

main().catch(console.error);