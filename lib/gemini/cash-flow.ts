export type CategorySummary = Record<string, number>;

export type PeriodCashFlow = {
  incomeTotal: number;
  expenseTotal: number;
  saved: number;
  savingsRatePercent: number | null;
  incomeSummary: CategorySummary;
  expenseSummary: CategorySummary;
};

export function computeSavingsRate(
  incomeTotal: number,
  expenseTotal: number,
): number | null {
  if (incomeTotal <= 0) return null;
  const saved = incomeTotal - expenseTotal;
  return Math.round((saved / incomeTotal) * 1000) / 10;
}

export function buildPeriodCashFlow(
  incomeSummary: CategorySummary,
  incomeTotal: number,
  expenseSummary: CategorySummary,
  expenseTotal: number,
): PeriodCashFlow {
  const saved = incomeTotal - expenseTotal;
  return {
    incomeTotal,
    expenseTotal,
    saved,
    savingsRatePercent: computeSavingsRate(incomeTotal, expenseTotal),
    incomeSummary,
    expenseSummary,
  };
}

export function summarizeByCategory(
  rows: Array<{
    amount: number;
    date: string;
    categoryName: string | null | undefined;
  }>,
  rangeStart: string,
  rangeEndExclusive: string,
): { summary: CategorySummary; total: number } {
  const summary: CategorySummary = {};
  let total = 0;

  for (const row of rows) {
    if (row.date < rangeStart || row.date >= rangeEndExclusive) continue;
    const amount = Number(row.amount);
    const key = row.categoryName?.trim() || "Other";
    summary[key] = (summary[key] ?? 0) + amount;
    total += amount;
  }

  return { summary, total };
}

export function formatCategoryLines(summary: CategorySummary): string {
  const lines = Object.entries(summary)
    .sort(([, a], [, b]) => b - a)
    .map(([name, amount]) => `- ${name}: ৳${amount}`);
  return lines.length > 0 ? lines.join("\n") : "- None";
}

export function formatSavingsRateLabel(rate: number | null): string {
  if (rate === null) return "N/A (no income logged)";
  return `${rate}%`;
}
