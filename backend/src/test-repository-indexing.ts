import "dotenv/config";

import { repositoryIndexingService } from "./services/repository-indexing.service";

async function main() {
  const repositoryId = "cmsd9zh9s0000q4vryqgyoo3i";

  await repositoryIndexingService.indexRepository(repositoryId);
}

main().catch(console.error);