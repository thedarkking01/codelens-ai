import { prisma } from "../config/prisma";

export class IndexingJobRepository {
  async findById(id: string) {
    return prisma.indexingJob.findUnique({
      where: {
        id,
      },
      include: {
        repository: {
          select: {
            id: true,
            name: true,
            githubUrl: true,
            status: true,
            userId: true,
          },
        },
      },
    });
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ) {
    return prisma.indexingJob.findFirst({
      where: {
        id,
        repository: {
          userId,
        },
      },
      include: {
        repository: {
          select: {
            id: true,
            name: true,
            githubUrl: true,
            status: true,
            userId: true,
          },
        },
      },
    });
  }
}

export const indexingJobRepository =
  new IndexingJobRepository();