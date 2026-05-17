import { NextResponse } from "next/server";

import {
  getWeekEndExclusive,
  getWeekStartInDhaka,
} from "@/lib/dates";
import {
  getCachedInsight,
  getInsightCacheRecord,
  INSIGHT_REFRESH_COOLDOWN_MS,
  saveInsightCache,
} from "@/lib/data/insights";
import { requireApiUser } from "@/lib/gemini/auth";
import { generateJson } from "@/lib/gemini/client";
import { buildWeeklyInsightPrompt } from "@/lib/gemini/prompts";
import { checkGeminiRateLimit } from "@/lib/gemini/rate-limit";
import { weeklyInsightResponseSchema } from "@/lib/gemini/schemas";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;
  const weekStart = getWeekStartInDhaka();
  const weekEnd = getWeekEndExclusive(weekStart);

  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "1";

  try {
    if (!forceRefresh) {
      const cached = await getCachedInsight(user.id, weekStart);
      if (cached) {
        return NextResponse.json({ insight: cached, cached: true });
      }
    } else {
      const record = await getInsightCacheRecord(user.id, weekStart);
      if (record) {
        const elapsed = Date.now() - new Date(record.created_at).getTime();
        if (elapsed < INSIGHT_REFRESH_COOLDOWN_MS) {
          const retryAfterSeconds = Math.ceil(
            (INSIGHT_REFRESH_COOLDOWN_MS - elapsed) / 1000,
          );
          return NextResponse.json(
            {
              error: "Insight was refreshed recently. Try again later.",
              retryAfterSeconds,
              insight: record.content,
            },
            { status: 429 },
          );
        }
      }
    }

    if (!checkGeminiRateLimit(user.id)) {
      return NextResponse.json(
        { error: "AI busy — insight unavailable right now." },
        { status: 429 },
      );
    }

    const { data: expenses, error } = await supabase
      .from("expenses")
      .select("amount, categories(name)")
      .gte("expense_date", weekStart)
      .lt("expense_date", weekEnd);

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          { error: "Run migration 003_insight_cache.sql in Supabase" },
          { status: 503 },
        );
      }
      throw new Error(error.message);
    }

    const summary: Record<string, number> = {};
    let total = 0;

    for (const row of expenses ?? []) {
      const amount = Number(row.amount);
      const cat = row.categories as { name: string } | { name: string }[] | null;
      const name = Array.isArray(cat) ? cat[0]?.name : cat?.name;
      const key = name ?? "Other";
      summary[key] = (summary[key] ?? 0) + amount;
      total += amount;
    }

    if (total === 0) {
      return NextResponse.json({
        insight: null,
        message: "No spending this week yet.",
      });
    }

    const prompt = buildWeeklyInsightPrompt(summary, total);
    const raw = await generateJson<unknown>(prompt);
    const { insight } = weeklyInsightResponseSchema.parse(raw);

    await saveInsightCache(user.id, insight, weekStart);

    return NextResponse.json({ insight, cached: false });
  } catch (err) {
    if (err instanceof Error && err.name === "GeminiRateLimitError") {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    console.error("weekly-insight:", err);
    return NextResponse.json(
      { error: "Insight unavailable." },
      { status: 500 },
    );
  }
}
