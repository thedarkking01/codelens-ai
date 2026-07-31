import { prisma } from "../config/prisma";
import type { Prisma, File } from "../generated/prisma/client";

export interface CreateFileData {
  repositoryId: string;
  path: string;
  name: string;
  extension: string | null;
  language: string | null;
  size: number;
  content: string;
}

export class FileRepository {
  async createMany(files: CreateFileData[]): Promise<void> {
    if (files.length === 0) {
      return;
    }

    await prisma.file.createMany({
      data: files,
    });
  }

  async findByRepositoryId(repositoryId: string): Promise<File[]> {
    return prisma.file.findMany({
      where: {
        repositoryId,
      },
      orderBy: {
        path: "asc",
      },
    });
  }

  async deleteByRepositoryId(repositoryId: string): Promise<void> {
    await prisma.file.deleteMany({
      where: {
        repositoryId,
      },
    });
  }
  async findAllByRepositoryId(repositoryId: string): Promise<File[]> {
    return prisma.file.findMany({
      where: {
        repositoryId,
      },
      orderBy: {
        path: "asc",
      },
    });
  }

  async findByIdAndRepositoryId(
    fileId: string,
    repositoryId: string,
  ): Promise<File | null> {
    return prisma.file.findFirst({
      where: {
        id: fileId,
        repositoryId,
      },
    });
  }
}

export const fileRepository = new FileRepository();
