import { RetrievedChunk } from "../types/chat.types";

class PromptBuilderService {
  buildPrompt(
    question: string,
    chunks: RetrievedChunk[]
  ): string {
    const context = this.buildContext(chunks);

    return `
            You are CodeLens AI, an expert software architect and senior software engineer.

            Your task is to answer questions ONLY using the provided repository context.

            Rules:

            1. Use ONLY the repository context.
            2. Never invent files, functions, or code.
            3. If the answer is not present in the context, reply exactly:

            "I couldn't find enough information in this repository."

            4. Mention relevant filenames when explaining.
            5. Keep answers concise but technically accurate.

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

            private buildContext(chunks: RetrievedChunk[]): string {
                return chunks
                .map(
                    (chunk) => `
            File: ${chunk.filePath}
            Lines: ${chunk.startLine}-${chunk.endLine}

            ${chunk.content}

            ----------------------------------------
            `
      )
      .join("\n");
  }
}

export const promptBuilder = new PromptBuilderService();