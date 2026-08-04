import { prisma } from "../config/prisma";

export class ChunkRepository {
  async createMany(
    data: {
      fileId: string;
      content: string;
      chunkIndex: number;
      startLine: number;
      endLine: number;
    }[],
  ) {
    return prisma.chunk.createMany({
      data,
    });
  }

  async findByFileId(fileId: string) {
    return prisma.chunk.findMany({
      where: {
        fileId,
      },
      orderBy: {
        chunkIndex: "asc",
      },
    });
  }

  async findById(chunkId: string) {
    return prisma.chunk.findUnique({
      where: {
        id: chunkId,
      },
    });
  }

  async deleteByFileId(fileId: string) {
    return prisma.chunk.deleteMany({
      where: {
        fileId,
      },
    });
  }

  async countByFileId(fileId: string) {
    return prisma.chunk.count({
      where: {
        fileId,
      },
    });
  }

  async findByRepositoryId(repositoryId: string) {
    return prisma.chunk.findMany({
      where: {
        file: {
          repositoryId,
        },
      },
      include: {
        file: true,
      },
      orderBy: [
        {
          file: {
            path: "asc",
          },
        },
        {
          chunkIndex: "asc",
        },
      ],
    });
  }

  async updateEmbeddingMetadata(chunkId: string, embeddingId: string) {
    return prisma.chunk.update({
      where: {
        id: chunkId,
      },
      data: {
        embeddingId,
        embeddedAt: new Date(),
      },
    });
  }
}

export const chunkRepository = new ChunkRepository();
