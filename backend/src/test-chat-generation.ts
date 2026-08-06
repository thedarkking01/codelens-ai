import "dotenv/config";

import { geminiChatService } from "./services/gemini-chat.service";

async function main() {
  const answer = await geminiChatService.generateAnswer(`
You are a helpful software engineer.

Question:
What is JWT authentication?
`);

  console.log(answer);
}

main().catch(console.error);