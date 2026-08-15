import { searchService } from "./search.service";
import { promptBuilder } from "./prompt-builder.service";
import { geminiChatService } from "./gemini-chat.service";
import { chatRepository } from "../repositories/chat.repository";
import { ChatInput } from "../validators/chat.validator";
import {
  ChatResponse,
  RetrievedChunk,
  ChatHistoryMessage,
} from "../types/chat.types";
import { ChatMessageRole } from "../generated/prisma/enums";
import { repositoryRepository } from "../repositories/repository.repository";

class ChatService {
  // =========================================================
  // PHASE 6 — Single Question RAG
  // =========================================================

  async askQuestion(data: ChatInput): Promise<ChatResponse> {
    // 1. Search repository
    const search = await searchService.searchRepository(
      data.repositoryId,
      data.question,
      5,
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
      }),
    );

    // 4. Build Gemini prompt
    const prompt = promptBuilder.buildPrompt(
      data.question,
      chunks,
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

  // =========================================================
  // PHASE 7 — CHAT SESSIONS
  // =========================================================

  async createSession(
  userId: string,
  repositoryId: string,
) {
  // Verify that the repository belongs to the current user
  const repository =
    await repositoryRepository.findByIdAndUserId(
      repositoryId,
      userId,
    );

  if (!repository) {
    throw new Error(
      "Repository not found or you do not have access to it.",
    );
  }

  return chatRepository.createSession(
    userId,
    repositoryId,
  );
}

  async getSession(
    userId: string,
    sessionId: string,
  ) {
    const session =
      await chatRepository.findSessionById(sessionId);

    if (!session) {
      throw new Error("Chat session not found.");
    }

    // Security: session must belong to current user
    if (session.userId !== userId) {
      throw new Error(
        "You do not have access to this chat session.",
      );
    }

    return session;
  }

  async getUserSessions(userId: string) {
    return chatRepository.findSessionsByUser(userId);
  }

  async getMessages(
    userId: string,
    sessionId: string,
  ) {
    // Validate ownership first
    await this.getSession(userId, sessionId);

    return chatRepository.getMessages(sessionId);
  }

  async deleteSession(
    userId: string,
    sessionId: string,
  ) {
    // Validate ownership first
    await this.getSession(userId, sessionId);

    await chatRepository.deleteSession(sessionId);
  }

  // =========================================================
  // PHASE 7 — CONVERSATIONAL RAG
  // =========================================================

  async sendMessage(
    userId: string,
    sessionId: string,
    message: string,
  ) {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      throw new Error("Message cannot be empty.");
    }

    // 1. Validate session + ownership
    const session =
      await this.getSession(userId, sessionId);

    // 2. Get previous conversation BEFORE saving
    //    the current user message.
    const previousMessages =
      await chatRepository.getRecentMessages(
        sessionId,
        10,
      );

    const history: ChatHistoryMessage[] =
      previousMessages.map((message) => ({
        role: message.role,
        content: message.content,
      }));

    // 3. Save current USER message
    await chatRepository.createMessage(
      sessionId,
      ChatMessageRole.USER,
      trimmedMessage,
    );

    // 4. Search repository using current question
    const search =
      await searchService.searchRepository(
        session.repositoryId,
        trimmedMessage,
        5,
      );

    // 5. Convert results to RetrievedChunk
    const chunks: RetrievedChunk[] =
      search.results.map((result) => ({
        chunkId: result.chunkId,
        filePath: result.filePath,
        language: result.language,
        startLine: result.startLine,
        endLine: result.endLine,
        content: result.content,
        score: result.score,
      }));

    // 6. If repository context doesn't exist,
    //    don't ask Gemini to invent an answer.
    if (chunks.length === 0) {
      const answer =
        "I couldn't find enough information in this repository.";

      await chatRepository.createMessage(
        sessionId,
        ChatMessageRole.ASSISTANT,
        answer,
      );

      return {
        answer,
        sources: [],
      };
    }

    // 7. Build conversation-aware prompt
    const prompt = promptBuilder.buildPrompt(
      trimmedMessage,
      chunks,
      history,
    );

    // 8. Generate answer
    const answer =
      await geminiChatService.generateAnswer(prompt);

    // 9. Save ASSISTANT message
    await chatRepository.createMessage(
      sessionId,
      ChatMessageRole.ASSISTANT,
      answer,
    );

    // 10. Return answer + sources
    return {
      answer,
      sources: chunks.map((chunk) => ({
        chunkId: chunk.chunkId,
        filePath: chunk.filePath,
        language: chunk.language,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
        score: chunk.score ?? 0,
      })),
    };
  }
}

export const chatService = new ChatService();