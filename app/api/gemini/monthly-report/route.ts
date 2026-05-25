import { NextResponse } from "next/server";

import {
  addMonthsToMonthStart,
  formatMonthLabel,
  getMonthStartInDhaka,
} from "@/lib/dates";
import { requireApiUser } from "@/lib/gemini/auth";
import { generateJson } from "@/lib/gemini/client";
import { AI_LABELS } from "@/lib/gemini/labels";
import { buildMonthlyReportPrompt } from "@/lib/gemini/prompts";
import { checkGeminiRateLimit } from "@/lib/gemini/rate-limit";
import {
  GeminiKeyRequiredError,
  geminiKeyRequiredResponse,
  requireUserGeminiKey,
} from "@/lib/gemini/require-user-key";
import { monthlyReportResponseSchema } from "@/lib/gemini/schemas";

export async function POST() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;

  let apiKey: string;
  try {
    apiKey = await requireUserGeminiKey(user.id);
  } catch (err) {
    if (err instanceof GeminiKeyRequiredError) {
      return geminiKeyRequiredResponse();
    }
    throw err;
  }

  if (!checkGeminiRateLimit(user.id)) {
    return NextResponse.json(
      { error: AI_LABELS.insightUnavailable },
      { status: 429 },
    );
  }

  try {
    const currentMonth = getMonthStartInDhaka();
    const nextMonth = addMonthsToMonthStart(currentMonth, 1);
    const previousMonth = addMonthsToMonthStart(currentMonth, -1);

    const { data: expenses, error } = await supabase
      .from("expenses")
      .select("amount, expense_date, categories(name)")
      .gte("expense_date", previousMonth)
      .lt("expense_date", nextMonth);

    if (error) throw new Error(error.message);

    const currentSummary: Record<string, number> = {};
    const previousSummary: Record<string, number> = {};
    let currentTotal = 0;
    let previousTotal = 0;

    for (const row of expenses ?? []) {
      const amount = Number(row.amount);
      const cat = row.categories as { name: string } | { name: string }[] | null;
      const name = Array.isArray(cat) ? cat[0]?.name : cat?.name;
      const key = name ?? "Other";

      if (row.expense_date >= currentMonth && row.expense_date < nextMonth) {
        currentSummary[key] = (currentSummary[key] ?? 0) + amount;
        currentTotal += amount;
      } else if (
        row.expense_date >= previousMonth &&
        row.expense_date < currentMonth
      ) {
        previousSummary[key] = (previousSummary[key] ?? 0) + amount;
        previousTotal += amount;
      }
    }

    if (currentTotal === 0 && previousTotal === 0) {
      return NextResponse.json({
        report: null,
        message: "No spending data yet for a monthly report.",
      });
    }

    const raw = await generateJson<unknown>(
      buildMonthlyReportPrompt({
        monthLabel: formatMonthLabel(currentMonth),
        currentSummary,
        currentTotal,
        previousSummary,
        previousTotal,
      }),
      apiKey,
    );
    const { report } = monthlyReportResponseSchema.parse(raw);

    return NextResponse.json({ report });
  } catch (err) {
    if (err instanceof Error && err.name === "GeminiRateLimitError") {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    console.error("monthly-report:", err);
    return NextResponse.json(
      { error: "Monthly report unavailable." },
      { status: 500 },
    );
  }
}
