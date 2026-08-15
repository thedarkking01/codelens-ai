import { z } from "zod";

export const chatSchema = z.object({
  repositoryId: z.string().min(1, "Repository ID is required"),
  question: z
    .string()
    .min(5, "Question must be at least 5 characters")
    .max(1000, "Question is too long"),
});

export type ChatInput = z.infer<typeof chatSchema>;

export const createChatSessionSchema = z.object({
  repositoryId: z
    .string()
    .min(1, "Repository ID is required"),
});

export type CreateChatSessionInput =
  z.infer<typeof createChatSessionSchema>;

export const sendChatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message is too long"),
});

export type SendChatMessageInput =
  z.infer<typeof sendChatMessageSchema>;