import { RetrievedChunk } from "../types/chat.types";

class PromptBuilderService {
  buildPrompt(
    question: string,
    chunks: RetrievedChunk[]
  ): string {
    const context = this.buildContext(chunks);

    return `
You are CodeLens AI, an expert software architect and senior software engineer.

You answer questions ONLY using the repository context provided below.

Rules:

1. Use ONLY the repository context.
2. Never use outside knowledge.
3. Never invent files, functions, classes, or code.
4. Mention relevant filenames when explaining.
5. If multiple files are involved, explain how they work together.
6. Keep the answer concise but technically accurate.
7. If the answer cannot be found in the repository context, reply exactly:

"I couldn't find enough information in this repository."

==============================
Repository Context
==============================

${context}

==============================
User Question
==============================

${question}

==============================
Answer
==============================
`;
  }

  private buildContext(
    chunks: RetrievedChunk[]
  ): string {
    return chunks
      .map(
        (chunk, index) => `
========================================
Context ${index + 1}

File:
${chunk.filePath}

Language:
${chunk.language}

Lines:
${chunk.startLine}-${chunk.endLine}

Code:
${chunk.content}

========================================
`
      )
      .join("\n");
  }
}

export const promptBuilder =
  new PromptBuilderService();