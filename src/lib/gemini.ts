import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export function getGeminiModel() {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

export async function generateText(prompt: string): Promise<string> {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return "";
  }
}
