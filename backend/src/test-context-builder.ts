import { contextBuilderService } from "./services/context-builder.service";

const results = [
  {
    score: 0.91,
    chunkId: "chunk-1",
    filePath: "src/services/auth.service.ts",
    language: "typescript",
    startLine: 10,
    endLine: 40,
    content: `
function login() {
  const token = jwt.sign(payload, secret);
  return token;
}
`,
  },
  {
    score: 0.87,
    chunkId: "chunk-2",
    filePath: "src/middleware/auth.middleware.ts",
    language: "typescript",
    startLine: 5,
    endLine: 25,
    content: `
export const authenticate = (req, res, next) => {
  // authentication logic
};
`,
  },
];

const context = contextBuilderService.buildContext(results);

console.log("==============================");
console.log("Generated Context");
console.log("==============================");
console.log(context);