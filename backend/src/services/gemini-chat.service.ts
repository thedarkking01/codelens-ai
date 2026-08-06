import { geminiClient, CHAT_MODEL } from "../config/gemini";

class GeminiChatService {
  async generateAnswer(prompt: string): Promise<string> {
    if (!prompt.trim()) {
      throw new Error("Prompt cannot be empty.");
    }

    try {
      const response = await geminiClient.models.generateContent({
        model: CHAT_MODEL,
        contents: prompt,
      });

      const answer = response.text;

      if (!answer) {
        throw new Error("Gemini returned an empty response.");
      }

      return answer.trim();
    } catch (error) {
      console.error("Gemini text generation failed:", error);
      throw error;
    }
  }
}

export const geminiChatService = new GeminiChatService();