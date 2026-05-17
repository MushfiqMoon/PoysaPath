import { GoogleGenAI } from "@google/genai";

import { getGeminiApiKey } from "@/lib/env";

const MODEL = "gemini-2.5-flash";

let client: GoogleGenAI | null = null;

function getClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: getGeminiApiKey() });
  }
  return client;
}

export async function generateJson<T>(prompt: string): Promise<T> {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(text) as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("429") || message.toLowerCase().includes("quota")) {
      const rateErr = new Error("AI busy — try again or use manual entry.");
      rateErr.name = "GeminiRateLimitError";
      throw rateErr;
    }
    throw err;
  }
}
