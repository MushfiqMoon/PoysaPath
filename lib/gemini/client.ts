import { GoogleGenAI } from "@google/genai";

import { AI_LABELS } from "@/lib/gemini/labels";

const MODEL = "gemini-2.5-flash";

export async function generateJson<T>(
  prompt: string,
  apiKey: string,
): Promise<T> {
  const ai = new GoogleGenAI({ apiKey });

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
      const rateErr = new Error(AI_LABELS.aiBusy);
      rateErr.name = "GeminiRateLimitError";
      throw rateErr;
    }
    throw err;
  }
}
