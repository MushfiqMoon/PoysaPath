import { NextResponse } from "next/server";

import { getUserCategories } from "@/lib/data/categories";
import { requireApiUser } from "@/lib/gemini/auth";
import { resolveCategoryId } from "@/lib/gemini/categories";
import { generateJson } from "@/lib/gemini/client";
import { buildCategorizePrompt } from "@/lib/gemini/prompts";
import { checkGeminiRateLimit } from "@/lib/gemini/rate-limit";
import {
  categorizeRequestSchema,
  categorizeResponseSchema,
} from "@/lib/gemini/schemas";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const { user } = auth;

  if (!checkGeminiRateLimit(user.id)) {
    return NextResponse.json(
      { error: "AI busy — try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = categorizeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const categories = await getUserCategories();
    const prompt = buildCategorizePrompt(parsed.data.description, categories);
    const raw = await generateJson<unknown>(prompt);
    const gemini = categorizeResponseSchema.parse(raw);
    const categoryId = resolveCategoryId(gemini.category, categories);

    if (!categoryId) {
      return NextResponse.json(
        { error: `Unknown category: ${gemini.category}` },
        { status: 422 },
      );
    }

    return NextResponse.json({
      category: gemini.category,
      category_id: categoryId,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "GeminiRateLimitError") {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    console.error("categorize:", err);
    return NextResponse.json(
      { error: "Could not suggest category." },
      { status: 500 },
    );
  }
}
