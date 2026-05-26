import { GoalsManager } from "@/components/goals/goals-manager";
import { PageHeader } from "@/components/layout/page-header";
import { getUserCategories } from "@/lib/data/categories";
import { getFinancialGoals } from "@/lib/data/goals";
import { getMonthStartInDhaka } from "@/lib/dates";

export default async function SettingsGoalsPage() {
  const [goals, categories] = await Promise.all([
    getFinancialGoals(),
    getUserCategories(),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Financial goals"
        backHref="/settings"
        backLabel="Settings"
      />
      <GoalsManager
        goals={goals}
        categories={categories}
        currentMonth={getMonthStartInDhaka()}
      />
    </div>
  );
}
