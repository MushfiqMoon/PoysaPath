import dynamic from "next/dynamic";
import Link from "next/link";

import { ForwardLink } from "@/components/shared/forward-link";
import { BudgetSummaryRings } from "@/components/budget/budget-summary-rings";
import { CategoryBreakdown } from "@/components/budget/category-breakdown";
import { DashboardPullRefresh } from "@/components/dashboard/dashboard-pull-refresh";
import { EmptyState } from "@/components/shared/empty-state";
import { GoalsDashboardCard } from "@/components/dashboard/goals-dashboard-card";
import { RecurringDashboardCard } from "@/components/dashboard/recurring-dashboard-card";
import { Card } from "@/components/ui/card";
import { InsightCardSkeleton } from "@/components/dashboard/insight-card";
import { getAuthUser, getUserProfile } from "@/lib/auth/session";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getBudgetsWithSpent } from "@/lib/data/budgets";
import { getGeminiKeyStatus } from "@/lib/data/gemini-credentials";
import { getDashboardGoals } from "@/lib/data/goals";
import { getCachedInsight } from "@/lib/data/insights";
import { getRecurringAlerts } from "@/lib/data/recurring";
import {
  getMonthCategoryTotals,
  getMonthTotal,
  getRecentExpenses,
  getTodayTotal,
} from "@/lib/data/expenses";
import { formatCurrency, formatExpenseTitle, formatRelativeDay } from "@/lib/format";

const InsightCard = dynamic(
  () =>
    import("@/components/dashboard/insight-card").then((mod) => ({
      default: mod.InsightCard,
    })),
  {
    loading: () => <InsightCardSkeleton />,
  },
);

export default async function DashboardPage() {
  const [
    userProfile,
    user,
    todayTotal,
    monthTotal,
    categoryTotals,
    recent,
    budgets,
    goals,
    recurringAlerts,
  ] = await Promise.all([
      getUserProfile(),
      getAuthUser(),
      getTodayTotal(),
      getMonthTotal(),
      getMonthCategoryTotals(),
      getRecentExpenses(5),
      getBudgetsWithSpent(),
      getDashboardGoals(),
      getRecurringAlerts(),
    ]);

  const displayName = userProfile?.displayName ?? "there";
  const avatarUrl = userProfile?.avatarUrl ?? null;

  const geminiStatus = user
    ? await getGeminiKeyStatus(user.id)
    : { hasKey: false, keyHint: null };
  const cachedInsight =
    user && geminiStatus.hasKey ? await getCachedInsight(user.id) : null;

  const hasExpenses = monthTotal > 0 || recent.length > 0;

  return (
    <DashboardPullRefresh>
      <div className="space-y-6">
        <section>
          <div className={avatarUrl ? "flex items-center gap-4" : undefined}>
            {avatarUrl ? (
              <UserAvatar
                name={displayName}
                avatarUrl={avatarUrl}
                size={52}
                featured
              />
            ) : null}
            <div className="min-w-0">
              <p className="font-serif text-xl font-medium italic text-accent">
                Hi, {displayName}
              </p>
              <h2
                className="mt-0.5 text-2xl font-bold tracking-tight text-text"
                style={{ letterSpacing: "-0.02em" }}
              >
                Dashboard
              </h2>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Card elevated padding="md">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            ◇ Today
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-text">
              {formatCurrency(todayTotal)}
            </p>
          </Card>
          <Card elevated padding="md">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            ◇ This month
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-text">
              {formatCurrency(monthTotal)}
            </p>
          </Card>
        </div>

        <GoalsDashboardCard goals={goals} />

        {hasExpenses ? (
          <>
            <InsightCard
              hasGeminiKey={geminiStatus.hasKey}
              initialInsight={cachedInsight}
            />
            <RecurringDashboardCard items={recurringAlerts} />
            <BudgetSummaryRings budgets={budgets} />
            <CategoryBreakdown totals={categoryTotals} monthTotal={monthTotal} />

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-muted">Recent</h2>
                <ForwardLink href="/expenses">See all</ForwardLink>
              </div>
              <ul className="space-y-2">
                {recent.map((expense) => {
                  const categoryName = expense.categories?.name ?? "Expense";
                  return (
                    <li key={expense.id}>
                      <Link href={`/expenses/${expense.id}/edit`}>
                        <Card
                          padding="sm"
                          className="flex items-center justify-between transition-[border-color,box-shadow] duration-(--dur-short) hover:border-accent/35 hover:shadow-sm"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="text-xs text-text-muted">
                              {formatRelativeDay(expense.expense_date)}
                            </p>
                            <p className="font-medium text-text">
                              {formatExpenseTitle(expense.note, categoryName)}
                            </p>
                          </div>
                          <p className="shrink-0 font-semibold tabular-nums text-text">
                            {formatCurrency(Number(expense.amount))}
                          </p>
                        </Card>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        ) : (
          <EmptyState
            title="No expenses yet"
            description="Tap Add to log your first one."
            actionLabel="Add expense"
            actionHref="/add"
          />
        )}
      </div>
    </DashboardPullRefresh>
  );
}
