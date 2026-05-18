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
  return `Write a brief weekly spending insight (2-4 sentences) for a personal expense app user in Bangladesh.
Be friendly, specific, and practical. Use ৳ for amounts. Do not invent categories not in the data.

This week's totals:
${lines}
Total: ৳${total}

Return JSON only: { "insight": "your summary text" }`;
}
