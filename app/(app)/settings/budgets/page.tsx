import { BudgetsManager } from "@/components/budget/budgets-manager";
import { PageHeader } from "@/components/layout/page-header";
import {
  getBudgetsWithSpent,
  getCategoriesWithoutBudget,
} from "@/lib/data/budgets";
import { getMonthStartInDhaka } from "@/lib/dates";

export default async function SettingsBudgetsPage() {
  const monthStart = getMonthStartInDhaka();
  const [y, m] = monthStart.split("-");
  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(Number(y), Number(m) - 1, 1));

  const [budgets, unbudgetedCategories] = await Promise.all([
    getBudgetsWithSpent(monthStart),
    getCategoriesWithoutBudget(monthStart),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Budgets — ${monthLabel}`}
        backHref="/settings"
        backLabel="Settings"
      />
      <BudgetsManager
        budgets={budgets}
        unbudgetedCategories={unbudgetedCategories}
        monthLabel={monthLabel}
      />
    </div>
  );
}
