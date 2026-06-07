import { NextResponse } from "next/server";

import {
  addMonthsToMonthStart,
  formatMonthLabel,
  getMonthStartInDhaka,
  parseMonthStartParam,
} from "@/lib/dates";
import { getProfileReportLanguage } from "@/lib/data/monthly-reports";
import { requireApiUser } from "@/lib/gemini/auth";
import {
  buildPeriodCashFlow,
  summarizeByCategory,
} from "@/lib/gemini/cash-flow";
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
import { unwrapSupabaseJoin } from "@/lib/supabase/normalize";

async function parseRequestBody(request: Request) {
  try {
    const body = await request.json();
    return monthlyReportRequestSchema.parse(body ?? {});
  } catch {
    return monthlyReportRequestSchema.parse({});
  }
}

function categoryName(
  categories: { name: string } | { name: string }[] | null,
): string | undefined {
  const cat = unwrapSupabaseJoin(categories);
  return cat?.name;
}

function noDataMessage(language: "en" | "bn") {
  return language === "bn"
    ? "মাসিক রিপোর্ট তৈরির জন্য এখনও আয় বা খরচের ডেটা নেই।"
    : "No income or spending data yet for a monthly report.";
}

function hasPeriodActivity(totals: {
  incomeTotal: number;
  expenseTotal: number;
}) {
  return totals.incomeTotal > 0 || totals.expenseTotal > 0;
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

    const [expensesResult, incomesResult] = await Promise.all([
      supabase
        .from("expenses")
        .select("amount, expense_date, categories(name)")
        .eq("user_id", user.id)
        .gte("expense_date", previousMonth)
        .lt("expense_date", nextMonth),
      supabase
        .from("incomes")
        .select("amount, income_date, categories(name)")
        .eq("user_id", user.id)
        .gte("income_date", previousMonth)
        .lt("income_date", nextMonth),
    ]);

    if (expensesResult.error) throw new Error(expensesResult.error.message);
    if (incomesResult.error) throw new Error(incomesResult.error.message);

    const expenseRows = (expensesResult.data ?? []).map((row) => ({
      amount: Number(row.amount),
      date: row.expense_date as string,
      categoryName: categoryName(
        row.categories as { name: string } | { name: string }[] | null,
      ),
    }));
    const incomeRows = (incomesResult.data ?? []).map((row) => ({
      amount: Number(row.amount),
      date: row.income_date as string,
      categoryName: categoryName(
        row.categories as { name: string } | { name: string }[] | null,
      ),
    }));

    const currentExpenses = summarizeByCategory(
      expenseRows,
      reportMonth,
      nextMonth,
    );
    const previousExpenses = summarizeByCategory(
      expenseRows,
      previousMonth,
      reportMonth,
    );
    const currentIncomes = summarizeByCategory(
      incomeRows,
      reportMonth,
      nextMonth,
    );
    const previousIncomes = summarizeByCategory(
      incomeRows,
      previousMonth,
      reportMonth,
    );

    const current = buildPeriodCashFlow(
      currentIncomes.summary,
      currentIncomes.total,
      currentExpenses.summary,
      currentExpenses.total,
    );
    const previous = buildPeriodCashFlow(
      previousIncomes.summary,
      previousIncomes.total,
      previousExpenses.summary,
      previousExpenses.total,
    );

    if (!hasPeriodActivity(current) && !hasPeriodActivity(previous)) {
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
        current: {
          expenseSummary: current.expenseSummary,
          expenseTotal: current.expenseTotal,
          incomeSummary: current.incomeSummary,
          incomeTotal: current.incomeTotal,
          saved: current.saved,
          savingsRatePercent: current.savingsRatePercent,
        },
        previous: {
          expenseSummary: previous.expenseSummary,
          expenseTotal: previous.expenseTotal,
          incomeSummary: previous.incomeSummary,
          incomeTotal: previous.incomeTotal,
          saved: previous.saved,
          savingsRatePercent: previous.savingsRatePercent,
        },
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
      cashFlow: {
        current: {
          incomeTotal: current.incomeTotal,
          expenseTotal: current.expenseTotal,
          saved: current.saved,
          savingsRatePercent: current.savingsRatePercent,
        },
        previous: {
          incomeTotal: previous.incomeTotal,
          expenseTotal: previous.expenseTotal,
          saved: previous.saved,
          savingsRatePercent: previous.savingsRatePercent,
        },
      },
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
