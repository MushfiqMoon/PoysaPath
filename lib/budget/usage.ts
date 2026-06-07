export function getBudgetUsage(spent: number, amount: number) {
  const rawPct = amount > 0 ? Math.min(100, (spent / amount) * 100) : 0;
  const pct = Math.round(rawPct);
  const over = spent > amount;
  return { pct, rawPct, over };
}
