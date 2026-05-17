import { NextResponse } from "next/server";

import { getTodayInDhaka } from "@/lib/dates";
import { getUserCategories } from "@/lib/data/categories";
import { requireApiUser } from "@/lib/gemini/auth";
import { resolveCategoryId } from "@/lib/gemini/categories";
import { generateJson } from "@/lib/gemini/client";
import { buildParseExpensePrompt } from "@/lib/gemini/prompts";
import { checkGeminiRateLimit } from "@/lib/gemini/rate-limit";
import {
  parseExpenseRequestSchema,
  parseExpenseResponseSchema,
} from "@/lib/gemini/schemas";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const { user } = auth;

  if (!checkGeminiRateLimit(user.id)) {
    return NextResponse.json(
      { error: "AI busy — try again or use manual entry." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseExpenseRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const categories = await getUserCategories();
    if (categories.length === 0) {
      return NextResponse.json(
        { error: "No categories found for your account" },
        { status: 400 },
      );
    }

    const today = getTodayInDhaka();
    const prompt = buildParseExpensePrompt(
      parsed.data.text,
      categories,
      today,
    );
    const raw = await generateJson<unknown>(prompt);
    const gemini = parseExpenseResponseSchema.parse(raw);
    const categoryId = resolveCategoryId(gemini.category, categories);

    if (!categoryId) {
      return NextResponse.json(
        { error: `Could not match category: ${gemini.category}` },
        { status: 422 },
      );
    }

    return NextResponse.json({
      amount: gemini.amount,
      category: gemini.category,
      category_id: categoryId,
      note: gemini.note ?? null,
      expense_date: gemini.expense_date,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "GeminiRateLimitError") {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    console.error("parse-expense:", err);
    return NextResponse.json(
      { error: "Could not parse expense. Try manual entry." },
      { status: 500 },
    );
  }
}
