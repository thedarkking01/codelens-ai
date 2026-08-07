import { searchService } from "./search.service";
import { promptBuilder } from "./prompt-builder.service";
import { geminiChatService } from "./gemini-chat.service";
import { ChatInput } from "../validators/chat.validator";
import {
  ChatResponse,
  RetrievedChunk,
} from "../types/chat.types";

class ChatService {
  async askQuestion(data: ChatInput): Promise<ChatResponse> {
    // 1. Search repository
    const search = await searchService.searchRepository(
      data.repositoryId,
      data.question,
      5
    );

    // 2. No relevant results
    if (search.totalResults === 0) {
      return {
        answer:
          "I couldn't find enough information in this repository.",
        sources: [],
      };
    }

    // 3. Convert search results into RetrievedChunk objects
    const chunks: RetrievedChunk[] = search.results.map(
      (result) => ({
        chunkId: result.chunkId,
        filePath: result.filePath,
        language: result.language,
        startLine: result.startLine,
        endLine: result.endLine,
        content: result.content,
        score: result.score,
      })
    );

    // 4. Build the Gemini prompt
    const prompt = promptBuilder.buildPrompt(
      data.question,
      chunks
    );

    // 5. Generate AI answer
    const answer =
      await geminiChatService.generateAnswer(prompt);

    // 6. Build source references
    const sources = chunks.map((chunk) => ({
      chunkId: chunk.chunkId,
      filePath: chunk.filePath,
      language: chunk.language,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
      score: chunk.score ?? 0,
    }));

    // 7. Return answer + sources
    return {
      answer,
      sources,
    };
  }
}

export const chatService = new ChatService();