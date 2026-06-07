import { NextResponse } from "next/server";

import {
  addDaysYmd,
  getInsightCachePeriodKeyInDhaka,
  getRolling7DayRangeInDhaka,
} from "@/lib/dates";
import { getBudgetsWithSpent } from "@/lib/data/budgets";
import {
  getCachedInsight,
  getInsightCacheRecord,
  INSIGHT_REFRESH_COOLDOWN_MS,
  saveInsightCache,
} from "@/lib/data/insights";
import { requireApiUser } from "@/lib/gemini/auth";
import { generateJson } from "@/lib/gemini/client";
import { buildMoneyCoachPrompt } from "@/lib/gemini/prompts";
import {
  GeminiKeyRequiredError,
  geminiKeyRequiredResponse,
  requireUserGeminiKey,
} from "@/lib/gemini/require-user-key";
import { AI_LABELS } from "@/lib/gemini/labels";
import { checkGeminiRateLimit } from "@/lib/gemini/rate-limit";
import { weeklyInsightResponseSchema } from "@/lib/gemini/schemas";
import { unwrapSupabaseJoin } from "@/lib/supabase/normalize";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;
  const periodKey = getInsightCachePeriodKeyInDhaka();
  const { start: rangeStart, end: rangeEnd } = getRolling7DayRangeInDhaka();

  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "1";

  let apiKey: string;
  try {
    apiKey = await requireUserGeminiKey(user.id);
  } catch (err) {
    if (err instanceof GeminiKeyRequiredError) {
      return geminiKeyRequiredResponse();
    }
    throw err;
  }

  try {
    if (!forceRefresh) {
      const cached = await getCachedInsight(user.id, periodKey);
      if (cached) {
        return NextResponse.json({ insight: cached, cached: true });
      }
    } else {
      const record = await getInsightCacheRecord(user.id, periodKey);
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
        { error: AI_LABELS.insightUnavailable },
        { status: 429 },
      );
    }

    const previousStart = addDaysYmd(rangeStart, -7);
    const previousEnd = addDaysYmd(rangeStart, -1);

    const [expensesResult, incomesResult] = await Promise.all([
      supabase
        .from("expenses")
        .select("amount, expense_date, categories(name)")
        .gte("expense_date", previousStart)
        .lte("expense_date", rangeEnd),
      supabase
        .from("incomes")
        .select("amount, income_date, categories(name)")
        .gte("income_date", previousStart)
        .lte("income_date", rangeEnd),
    ]);

    if (expensesResult.error) {
      if (expensesResult.error.code === "42P01") {
        return NextResponse.json(
          { error: "Run migration 003_insight_cache.sql in Supabase" },
          { status: 503 },
        );
      }
      throw new Error(expensesResult.error.message);
    }
    if (incomesResult.error) throw new Error(incomesResult.error.message);

    const expenses = expensesResult.data;

    const currentSummary: Record<string, number> = {};
    const previousSummary: Record<string, number> = {};
    let currentTotal = 0;
    let previousTotal = 0;
    let currentIncomeTotal = 0;
    let previousIncomeTotal = 0;

    for (const row of expenses ?? []) {
      const amount = Number(row.amount);
      const cat = unwrapSupabaseJoin(
        row.categories as { name: string } | { name: string }[] | null,
      );
      const name = cat?.name;
      const key = name ?? "Other";
      if (row.expense_date >= rangeStart && row.expense_date <= rangeEnd) {
        currentSummary[key] = (currentSummary[key] ?? 0) + amount;
        currentTotal += amount;
      } else if (row.expense_date >= previousStart && row.expense_date <= previousEnd) {
        previousSummary[key] = (previousSummary[key] ?? 0) + amount;
        previousTotal += amount;
      }
    }

    for (const row of incomesResult.data ?? []) {
      const amount = Number(row.amount);
      const date = row.income_date as string;
      if (date >= rangeStart && date <= rangeEnd) {
        currentIncomeTotal += amount;
      } else if (date >= previousStart && date <= previousEnd) {
        previousIncomeTotal += amount;
      }
    }

    if (
      currentTotal === 0 &&
      previousTotal === 0 &&
      currentIncomeTotal === 0 &&
      previousIncomeTotal === 0
    ) {
      return NextResponse.json({
        insight: null,
        message: "No income or spending yet for Money Coach.",
      });
    }

    const budgets = await getBudgetsWithSpent();
    const budgetLines = budgets.slice(0, 5).map((budget) => {
      const remaining = Math.max(0, budget.amount - budget.spent);
      return `${budget.category.name}: spent ৳${budget.spent} of ৳${budget.amount}, remaining ৳${remaining}`;
    });

    const prompt = buildMoneyCoachPrompt({
      currentSummary,
      currentTotal,
      previousSummary,
      previousTotal,
      currentIncomeTotal,
      previousIncomeTotal,
      budgetLines,
    });
    const raw = await generateJson<unknown>(prompt, apiKey);
    const { insight } = weeklyInsightResponseSchema.parse(raw);

    await saveInsightCache(user.id, insight, periodKey);

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
