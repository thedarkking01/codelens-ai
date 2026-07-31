import { fileScannerService } from "./services/file-scanner.service";
import path from "path";

async function main() {
  const repositoryPath = path.resolve(
    "uploads/repositories/test-repository-001",
  );

  console.log("🔍 Scanning repository...");
  console.log(`📁 Path: ${repositoryPath}\n`);

  try {
    const files =
      await fileScannerService.scanRepository(
        repositoryPath,
      );

    console.log(
      "\n✅ Scan completed successfully!",
    );

    console.log(
      `📊 Files found: ${files.length}\n`,
    );

    for (const file of files) {
      console.log(
        `${file.language ?? "Unknown"} | ${file.path} | ${file.size} bytes`,
      );
    }
  } catch (error) {
    console.error(
      "❌ Repository scan failed:",
      error,
    );

    process.exitCode = 1;
  }
}

main();