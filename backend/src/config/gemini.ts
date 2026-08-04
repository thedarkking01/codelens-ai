import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured.");
}

export const geminiClient = new GoogleGenAI({
  apiKey,
});

export const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL ?? "gemini-embedding-001";