import { z } from "zod";

export const chatSchema = z.object({
  repositoryId: z.string().min(1, "Repository ID is required"),
  question: z
    .string()
    .min(5, "Question must be at least 5 characters")
    .max(1000, "Question is too long"),
});

export type ChatInput = z.infer<typeof chatSchema>;