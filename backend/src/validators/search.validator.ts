import { z } from "zod";

export const searchRepositorySchema = z.object({
  repositoryId: z.string().min(1, "Repository ID is required"),

  query: z
    .string()
    .min(3, "Search query must be at least 3 characters long")
    .max(500, "Search query is too long"),

  limit: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .default(5),
});

export type SearchRepositoryInput = z.infer<
  typeof searchRepositorySchema
>;