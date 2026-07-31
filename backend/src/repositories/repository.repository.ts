import { prisma } from "../config/prisma";
import type { Prisma, Repository, RepositoryStatus } from "../generated/prisma/client";

export class RepositoryRepository {
  async create(data: Prisma.RepositoryCreateInput): Promise<Repository> {
    return prisma.repository.create({
      data,
    });
  }

  async findAllByUserId(userId: string): Promise<Repository[]> {
    return prisma.repository.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string): Promise<Repository | null> {
    return prisma.repository.findUnique({
      where: {
        id,
      },
    });
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Repository | null> {
    return prisma.repository.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async delete(id: string): Promise<Repository> {
    return prisma.repository.delete({
      where: {
        id,
      },
    });
  }

  async updateStatus(
  id: string,
  status: RepositoryStatus,
): Promise<Repository> {
  return prisma.repository.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

async updateLocalPath(
  id: string,
  localPath: string,
): Promise<Repository> {
  return prisma.repository.update({
    where: {
      id,
    },
    data: {
      localPath,
    },
  });
}
}

export const repositoryRepository = new RepositoryRepository();

