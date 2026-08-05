import "dotenv/config";

import { searchService } from "./services/search.service.js";

async function main() {
  // Replace with your actual repository ID
  const repositoryId = "cmsgckvj50000c0vrtzxc9d9n";

  const queries = [
    "Where is JWT authentication implemented?",
    "Where are repositories cloned?",
    "Where are embeddings generated?",
    "Where is Qdrant initialized?",
    "How are files chunked?",
  ];

  for (const query of queries) {
    console.log("\n==============================");
    console.log(`Query: ${query}`);

    const result = await searchService.searchRepository(
      repositoryId,
      query,
      3
    );

    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error("Search test failed:", error);
});