import { CategoriesManager } from "@/components/categories-manager";
import { PageHeader } from "@/components/page-header";
import { getUserCategories } from "@/lib/data/categories";

export default async function CategoriesPage() {
  const categories = await getUserCategories();

  return (
    <div className="space-y-4">
      <PageHeader title="Categories" />
      <CategoriesManager categories={categories} />
    </div>
  );
}
