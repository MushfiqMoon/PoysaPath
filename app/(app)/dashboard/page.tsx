import dynamic from "next/dynamic";
import Link from "next/link";

import { CategoryBreakdown } from "@/components/category-breakdown";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const InsightCard = dynamic(
  () =>
    import("@/components/insight-card").then((mod) => ({
      default: mod.InsightCard,
    })),
  {
    loading: () => <Skeleton className="h-28 w-full rounded-xl" />,
  },
);
import { getAuthUser, getDisplayName } from "@/lib/auth/session";
import { getCachedInsight } from "@/lib/data/insights";
import {
  getMonthCategoryTotals,
  getMonthTotal,
  getRecentExpenses,
  getTodayTotal,
} from "@/lib/data/expenses";
import { formatCurrency, formatExpenseTitle, formatRelativeDay } from "@/lib/format";

export default async function DashboardPage() {
  const [displayName, user, todayTotal, monthTotal, categoryTotals, recent] =
    await Promise.all([
      getDisplayName(),
      getAuthUser(),
      getTodayTotal(),
      getMonthTotal(),
      getMonthCategoryTotals(),
      getRecentExpenses(5),
    ]);

  const cachedInsight = user ? await getCachedInsight(user.id) : null;

  const hasExpenses = monthTotal > 0 || recent.length > 0;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-text-muted">👋 Hi , {displayName}</p>
        <h2 className="mt-1 text-2xl font-semibold text-text">Dashboard</h2>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <article className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-text-muted">Today</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-text">
            {formatCurrency(todayTotal)}
          </p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-text-muted">Month</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-text">
            {formatCurrency(monthTotal)}
          </p>
        </article>
      </div>

      {hasExpenses ? (
        <>
          <InsightCard initialInsight={cachedInsight} />
          <CategoryBreakdown totals={categoryTotals} monthTotal={monthTotal} />

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-text-muted">Recent</h2>
              <Link href="/expenses" className="text-sm text-accent">
                See all →
              </Link>
            </div>
            <ul className="space-y-2">
              {recent.map((expense) => {
                const categoryName = expense.categories?.name ?? "Expense";
                return (
                  <li
                    key={expense.id}
                    className="flex justify-between rounded-xl border border-border bg-surface px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-text-muted">
                        {formatRelativeDay(expense.expense_date)}
                      </p>
                      <p className="font-medium text-text">
                        {formatExpenseTitle(expense.note, categoryName)}
                      </p>
                    </div>
                    <p className="font-semibold tabular-nums text-text">
                      {formatCurrency(Number(expense.amount))}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      ) : (
        <section className="rounded-xl border border-dashed border-border bg-surface p-6 text-center">
          <p className="text-text-muted">No expenses yet.</p>
          <p className="mt-1 text-sm text-text-muted">
            Tap + to log your first one.
          </p>
          <Link href="/add" className="mt-4 inline-block">
            <Button>Add expense</Button>
          </Link>
        </section>
      )}
    </div>
  );
}
