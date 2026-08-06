import { searchService } from "./search.service";
import { promptBuilder } from "./prompt-builder.service";
import { geminiChatService } from "./gemini-chat.service";
import { ChatInput } from "../validators/chat.validator";
import { ChatResponse, RetrievedChunk } from "../types/chat.types";

class ChatService {
  async askQuestion(data: ChatInput): Promise<ChatResponse> {
    // Step 1
    const search = await searchService.searchRepository(
      data.repositoryId,
      data.question,
      5
    );

    // Step 2
    if (search.totalResults === 0) {
      return {
        answer: "I couldn't find enough information in this repository.",
        sources: [],
      };
    }

    // Step 3
    const chunks: RetrievedChunk[] = search.results.map((result) => ({
      chunkId: result.chunkId,
      fileId: "",
      filePath: result.filePath,
      startLine: result.startLine,
      endLine: result.endLine,
      content: result.content,
      score: result.score,
    }));

    // Step 4
    const prompt = promptBuilder.buildPrompt(
      data.question,
      chunks
    );

    // Step 5
    const answer =
      await geminiChatService.generateAnswer(prompt);

    // Step 6
    return {
      answer,
      sources: chunks.map((chunk) => ({
        filePath: chunk.filePath,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
      })),
    };
  }
}

export const chatService = new ChatService();