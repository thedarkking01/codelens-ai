import "dotenv/config";

import { searchService } from "./services/search.service.js";

async function main() {
  // Replace with your actual repository ID
  const repositoryId = "cmsqes1qq0000uovrcu3lo8xs";

  const queries = [
    "Where is JWT authentication implemented?",
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