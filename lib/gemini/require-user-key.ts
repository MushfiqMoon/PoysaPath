import { NextResponse } from "next/server";

import { getDecryptedGeminiKey } from "@/lib/data/gemini-credentials";
import { buildGeminiKeyRequiredPayload } from "@/lib/gemini/disabled-message";

export class GeminiKeyRequiredError extends Error {
  constructor() {
    super("Gemini API key required");
    this.name = "GeminiKeyRequiredError";
  }
}

export async function requireUserGeminiKey(
  userId: string,
): Promise<string> {
  const key = await getDecryptedGeminiKey(userId);
  if (!key) {
    throw new GeminiKeyRequiredError();
  }
  return key;
}

export function geminiKeyRequiredResponse(): NextResponse {
  return NextResponse.json(buildGeminiKeyRequiredPayload(), { status: 403 });
}
