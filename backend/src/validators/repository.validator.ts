import { z } from "zod";

export const createRepositorySchema = z.object({
  githubUrl: z
    .string()
    .trim()
    .url("Invalid GitHub repository URL")
    .refine(
      (url) => {
        try {
          const parsedUrl = new URL(url);

          return (
            parsedUrl.protocol === "https:" &&
            parsedUrl.hostname === "github.com"
          );
        } catch {
          return false;
        }
      },
      {
        message: "Only valid GitHub repository URLs are allowed",
      },
    ),
});

export type CreateRepositoryInput = z.infer<
  typeof createRepositorySchema
>;

