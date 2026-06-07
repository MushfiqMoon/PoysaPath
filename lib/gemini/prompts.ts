import type { Category } from "@/lib/types";
import type { MonthlyReportLanguage } from "@/lib/data/monthly-reports";

export function buildParseExpensePrompt(
  text: string,
  categories: Category[],
  todayYmd: string,
) {
  const categoryList = categories.map((c) => c.name).join(", ");
  return `You parse daily expense entries for a Bangladesh user (BDT / taka).
Input may be English, Bangla, or Banglish.

Categories (pick exactly one name from this list): ${categoryList}
Today's date (Asia/Dhaka): ${todayYmd}
Currency: BDT only. Amount is a number in taka (no ৳ symbol in JSON).

User input: "${text}"

Return JSON only:
{
  "amount": number,
  "category": "exact category name from list",
  "note": "short description or null",
  "expense_date": "YYYY-MM-DD"
}`;
}

export function buildWeeklyInsightPrompt(
  summary: Record<string, number>,
  total: number,
) {
  const lines = Object.entries(summary)
    .map(([name, amount]) => `- ${name}: ৳${amount}`)
    .join("\n");
  return `Write a brief spending insight (2-4 sentences) for a personal expense app user in Bangladesh.
Be friendly, specific, and practical. Use ৳ for amounts. Do not invent categories not in the data.

Last 7 days (including today):
${lines}
Total: ৳${total}

Return JSON only: { "insight": "your summary text" }`;
}

export function buildMoneyCoachPrompt(input: {
  currentSummary: Record<string, number>;
  currentTotal: number;
  previousSummary: Record<string, number>;
  previousTotal: number;
  currentIncomeTotal: number;
  previousIncomeTotal: number;
  budgetLines: string[];
}) {
  const currentLines =
    Object.entries(input.currentSummary)
      .map(([name, amount]) => `- ${name}: ৳${amount}`)
      .join("\n") || "- No spending";
  const previousLines =
    Object.entries(input.previousSummary)
      .map(([name, amount]) => `- ${name}: ৳${amount}`)
      .join("\n") || "- No spending";
  const budgets = input.budgetLines.length
    ? input.budgetLines.map((line) => `- ${line}`).join("\n")
    : "- No active budgets";
  const currentSaved = input.currentIncomeTotal - input.currentTotal;
  const previousSaved = input.previousIncomeTotal - input.previousTotal;

  return `You are Money Coach inside a Bangladesh BDT personal finance tracker.
Write one practical coaching card, not a generic report.
Use a friendly professional tone, specific ৳ amounts, and one clear next action.
If there is enough data, compare the last 7 days with the previous 7 days.
When income is logged, mention cash flow (income vs spending) — not spending alone.
Do not shame the user. Do not invent categories or amounts.

Last 7 days — spending by category:
${currentLines}
Spent total: ৳${input.currentTotal}
Income total: ৳${input.currentIncomeTotal}
Saved (income − spending): ৳${currentSaved}

Previous 7 days — spending by category:
${previousLines}
Spent total: ৳${input.previousTotal}
Income total: ৳${input.previousIncomeTotal}
Saved (income − spending): ৳${previousSaved}

Current budget context:
${budgets}

Return JSON only:
{ "insight": "2-3 sentences with one concrete action" }`;
}

export function buildMonthlyReportPrompt(input: {
  monthLabel: string;
  language: MonthlyReportLanguage;
  current: {
    expenseSummary: Record<string, number>;
    expenseTotal: number;
    incomeSummary: Record<string, number>;
    incomeTotal: number;
    saved: number;
    savingsRatePercent: number | null;
  };
  previous: {
    expenseSummary: Record<string, number>;
    expenseTotal: number;
    incomeSummary: Record<string, number>;
    incomeTotal: number;
    saved: number;
    savingsRatePercent: number | null;
  };
}) {
  const currentExpenseLines =
    Object.entries(input.current.expenseSummary)
      .map(([name, amount]) => `- ${name}: ৳${amount}`)
      .join("\n") || "- No spending";
  const previousExpenseLines =
    Object.entries(input.previous.expenseSummary)
      .map(([name, amount]) => `- ${name}: ৳${amount}`)
      .join("\n") || "- No spending";
  const currentIncomeLines =
    Object.entries(input.current.incomeSummary)
      .map(([name, amount]) => `- ${name}: ৳${amount}`)
      .join("\n") || "- No income logged";
  const previousIncomeLines =
    Object.entries(input.previous.incomeSummary)
      .map(([name, amount]) => `- ${name}: ৳${amount}`)
      .join("\n") || "- No income logged";
  const languageInstruction =
    input.language === "bn"
      ? "Write all user-facing text in Bangla for a Bangladesh user. Keep currency as ৳ and use natural Bangla, not word-for-word translation."
      : "Write all user-facing text in English for a Bangladesh user. Keep currency as ৳ and use clear, simple wording.";
  const formatRate = (rate: number | null) =>
    rate === null ? "N/A (no income logged)" : `${rate}%`;

  return `Write a friendly monthly money report for ${input.monthLabel}.
Audience: Bangladesh personal finance tracker user. Currency: BDT.
${languageInstruction}
Cover income, spending, and what was saved when income exists.
Include wins, problem areas, biggest category changes, and a simple next-month plan.
Keep it concise and practical. Each array item should be one short sentence.
Use the exact income, expense, saved, and savings-rate figures below — do not invent amounts.
If income is ৳0, focus on spending but note that savings rate is unavailable until income is logged.

This month — income by category:
${currentIncomeLines}
Income total: ৳${input.current.incomeTotal}
Saved (income − expenses): ৳${input.current.saved}
Savings rate: ${formatRate(input.current.savingsRatePercent)}

This month — spending by category:
${currentExpenseLines}
Expense total: ৳${input.current.expenseTotal}

Previous month — income by category:
${previousIncomeLines}
Income total: ৳${input.previous.incomeTotal}
Saved: ৳${input.previous.saved}
Savings rate: ${formatRate(input.previous.savingsRatePercent)}

Previous month — spending by category:
${previousExpenseLines}
Expense total: ৳${input.previous.expenseTotal}

Return JSON only:
{
  "title": "short report title",
  "overview": "1-2 sentence summary of the month (income, spending, saved when relevant)",
  "cashFlowSummary": "one sentence on income vs spending and savings rate, using the figures above",
  "wins": ["1-3 specific wins"],
  "watchouts": ["1-3 practical problem areas"],
  "categoryChanges": ["1-3 biggest category changes"],
  "nextMonthPlan": ["2-4 concrete next-month actions"]
}`;
}
