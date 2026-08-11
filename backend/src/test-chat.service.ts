import "dotenv/config";

import { chatService } from "./services/chat.service";

const repositoryId = "cmsgckvj50000c0vrtzxc9d9n";

const questions = [
  "Where is JWT authentication implemented?",
  "Where are repositories cloned?",
  "Where are embeddings generated?",
  "Where is Qdrant initialized?",
  "How are files chunked?",
];

async function main() {
  for (const question of questions) {
    console.log("\n==============================");
    console.log("Question:", question);
    console.log("==============================");

    try {
      const response = await chatService.askQuestion({
        repositoryId,
        question,
      });

      console.log(
        JSON.stringify(response, null, 2)
      );
    } catch (error) {
      console.error("Chat failed:", error);
    }
  }
}

main();