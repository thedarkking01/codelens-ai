import { aiService } from "./services/ai.service";

async function main() {
  const prompt = `
You are CodeLens AI.

Use ONLY the repository context below.

Repository Context:

File: src/services/auth.service.ts

Code:

function login() {
  const token = jwt.sign(payload, secret);
  return token;
}

File: src/middleware/auth.middleware.ts

Code:

export const authenticate = (req, res, next) => {
  // authentication logic
};

Question:

Explain the authentication flow.
`;

  const answer = await aiService.generateAnswer(prompt);

  console.log("==============================");
  console.log("AI Answer");
  console.log("==============================");
  console.log(answer);
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});