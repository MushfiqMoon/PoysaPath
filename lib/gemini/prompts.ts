import type { Category } from "@/lib/types";

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

  return `You are Money Coach inside a Bangladesh BDT expense tracker.
Write one practical coaching card, not a generic report.
Use a friendly professional tone, specific ৳ amounts, and one clear next action.
If there is enough data, compare the last 7 days with the previous 7 days.
Do not shame the user. Do not invent categories.

Last 7 days:
${currentLines}
Total: ৳${input.currentTotal}

Previous 7 days:
${previousLines}
Total: ৳${input.previousTotal}

Current budget context:
${budgets}

Return JSON only:
{ "insight": "2-3 sentences with one concrete action" }`;
}

export function buildMonthlyReportPrompt(input: {
  monthLabel: string;
  currentSummary: Record<string, number>;
  currentTotal: number;
  previousSummary: Record<string, number>;
  previousTotal: number;
}) {
  const currentLines =
    Object.entries(input.currentSummary)
      .map(([name, amount]) => `- ${name}: ৳${amount}`)
      .join("\n") || "- No spending";
  const previousLines =
    Object.entries(input.previousSummary)
      .map(([name, amount]) => `- ${name}: ৳${amount}`)
      .join("\n") || "- No spending";

  return `Write a friendly end-of-month expense report for ${input.monthLabel}.
Audience: Bangladesh personal expense tracker user. Currency: BDT.
Include wins, problem areas, biggest category changes, and a simple next-month plan.
Keep it concise and practical. Use bullet-like short paragraphs inside one string.
Do not invent categories or data.

This month:
${currentLines}
Total: ৳${input.currentTotal}

Previous month:
${previousLines}
Total: ৳${input.previousTotal}

Return JSON only:
{ "report": "monthly report text" }`;
}
