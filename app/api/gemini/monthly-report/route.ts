import { NextResponse } from "next/server";

import {
  addMonthsToMonthStart,
  formatMonthLabel,
  getMonthStartInDhaka,
  parseMonthStartParam,
} from "@/lib/dates";
import { getProfileReportLanguage } from "@/lib/data/monthly-reports";
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
import {
  monthlyReportRequestSchema,
  monthlyReportResponseSchema,
} from "@/lib/gemini/schemas";

async function parseRequestBody(request: Request) {
  try {
    const body = await request.json();
    return monthlyReportRequestSchema.parse(body ?? {});
  } catch {
    return monthlyReportRequestSchema.parse({});
  }
}

function noDataMessage(language: "en" | "bn") {
  return language === "bn"
    ? "মাসিক রিপোর্ট তৈরির জন্য এখনও খরচের ডেটা নেই।"
    : "No spending data yet for a monthly report.";
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;

  try {
    const body = await parseRequestBody(request);
    const defaultLanguage = await getProfileReportLanguage(user.id);
    const language = body.language ?? defaultLanguage;
    const currentMonth = getMonthStartInDhaka();
    const reportMonth = parseMonthStartParam(body.month, currentMonth);

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

    const nextMonth = addMonthsToMonthStart(reportMonth, 1);
    const previousMonth = addMonthsToMonthStart(reportMonth, -1);

    const { data: expenses, error } = await supabase
      .from("expenses")
      .select("amount, expense_date, categories(name)")
      .eq("user_id", user.id)
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

      if (row.expense_date >= reportMonth && row.expense_date < nextMonth) {
        currentSummary[key] = (currentSummary[key] ?? 0) + amount;
        currentTotal += amount;
      } else if (
        row.expense_date >= previousMonth &&
        row.expense_date < reportMonth
      ) {
        previousSummary[key] = (previousSummary[key] ?? 0) + amount;
        previousTotal += amount;
      }
    }

    if (currentTotal === 0 && previousTotal === 0) {
      return NextResponse.json({
        report: null,
        content: null,
        month: reportMonth,
        language,
        message: noDataMessage(language),
      });
    }

    const raw = await generateJson<unknown>(
      buildMonthlyReportPrompt({
        monthLabel: formatMonthLabel(reportMonth, ""),
        language,
        currentSummary,
        currentTotal,
        previousSummary,
        previousTotal,
      }),
      apiKey,
    );
    const report = monthlyReportResponseSchema.parse(raw);
    const content = JSON.stringify(report);
    const generatedAt = new Date().toISOString();

    return NextResponse.json({
      report,
      content,
      month: reportMonth,
      language,
      generatedAt,
      message: "Report generated. Save it to keep it.",
      source: "generated",
    });
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
