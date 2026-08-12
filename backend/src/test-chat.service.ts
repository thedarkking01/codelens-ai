import "dotenv/config";

import { chatService } from "./services/chat.service";

const repositoryId = "cmsqes1qq0000uovrcu3lo8xs";

const questions = [
  "How do I start the FastAPI server?",
  "What API endpoints are available for expenses?",
  "How can I filter expenses by category?",
  "What validation rules are applied to expenses?",
  "What database does the application use?",
  "How do I create a new expense?",
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