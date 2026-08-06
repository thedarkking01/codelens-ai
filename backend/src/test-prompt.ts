import { promptBuilder } from "./services/prompt-builder.service";

const prompt = promptBuilder.buildPrompt(
  "Explain authentication flow",
  [
    {
      chunkId: "1",
      fileId: "1",
      filePath: "src/services/auth.service.ts",
      startLine: 10,
      endLine: 40,
      content: "function login() { ... }",
      score: 0.92,
    },
    {
      chunkId: "2",
      fileId: "2",
      filePath: "src/middleware/auth.middleware.ts",
      startLine: 5,
      endLine: 25,
      content: "export const authenticate = ...",
      score: 0.89,
    },
  ]
);

console.log(prompt);