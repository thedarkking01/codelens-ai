import { PrismaClient } from "../generated/prisma/client";
import { ChatMessageRole } from "../generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

export class ChatRepository {
  async createSession(
    userId: string,
    repositoryId: string,
    title: string = "New Repository Chat"
  ) {
    return prisma.chatSession.create({
      data: {
        userId,
        repositoryId,
        title,
      },
    });
  }

  async findSessionById(sessionId: string) {
    return prisma.chatSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        repository: true,
      },
    });
  }

  async findSessionsByUser(userId: string) {
    return prisma.chatSession.findMany({
      where: {
        userId,
      },
      include: {
        repository: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async deleteSession(sessionId: string) {
    return prisma.chatSession.delete({
      where: {
        id: sessionId,
      },
    });
  }

  async createMessage(
    sessionId: string,
    role: ChatMessageRole,
    content: string
  ) {
    return prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
      },
    });
  }

  async getMessages(sessionId: string) {
    return prisma.chatMessage.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async getRecentMessages(sessionId: string, limit: number = 10) {
    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return messages.reverse();
  }
}

export const chatRepository = new ChatRepository();