import { geminiClient } from "../config/gemini";

export class AIService {
  async generateAnswer(prompt: string): Promise<string> {
    if (!prompt.trim()) {
      throw new Error("Prompt cannot be empty.");
    }

    try {
      const response = await geminiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const answer = response.text;

      if (!answer) {
        throw new Error("Gemini returned an empty response.");
      }

      return answer.trim();
    } catch (error) {
      console.error("Gemini answer generation failed:", error);
      throw error;
    }
  }
}

export const aiService = new AIService();