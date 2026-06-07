import { CategoriesManager } from "@/components/categories/categories-manager";
import { PageHeader } from "@/components/layout/page-header";
import { getExpenseCategories, getIncomeCategories } from "@/lib/data/categories";

export default async function SettingsCategoriesPage() {
  const [expenseCategories, incomeCategories] = await Promise.all([
    getExpenseCategories(),
    getIncomeCategories(),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Categories"
        backHref="/settings"
        backLabel="Settings"
      />
      <CategoriesManager
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
      />
    </div>
  );
}
