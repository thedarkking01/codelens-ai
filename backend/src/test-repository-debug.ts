import { repositoryRepository } from "./repositories/repository.repository";

async function main() {
  const repositoryId = "cmsqes1qq0000uovrcu3lo8xs";

  const repository =
    await repositoryRepository.findById(repositoryId);

  console.log(
    JSON.stringify(repository, null, 2),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });