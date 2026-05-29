import { PageHeader } from "@/components/layout/page-header";
import { RecurringManager } from "@/components/recurring/recurring-manager";
import { getUserCategories } from "@/lib/data/categories";
import { getLinkableFinancialGoals } from "@/lib/data/goals";
import { getRecurringItems } from "@/lib/data/recurring";

export default async function SettingsRecurringPage() {
  const [items, categories, linkableGoals] = await Promise.all([
    getRecurringItems(),
    getUserCategories(),
    getLinkableFinancialGoals(),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Recurring payments"
        backHref="/settings"
        backLabel="Settings"
      />
      <RecurringManager
        items={items}
        categories={categories}
        linkableGoals={linkableGoals}
      />
    </div>
  );
}
