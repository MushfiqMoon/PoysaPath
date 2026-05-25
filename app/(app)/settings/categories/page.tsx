import { CategoriesManager } from "@/components/categories/categories-manager";
import { PageHeader } from "@/components/layout/page-header";
import { getUserCategories } from "@/lib/data/categories";

export default async function SettingsCategoriesPage() {
  const categories = await getUserCategories();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Categories"
        backHref="/settings"
        backLabel="Settings"
      />
      <CategoriesManager categories={categories} />
    </div>
  );
}
