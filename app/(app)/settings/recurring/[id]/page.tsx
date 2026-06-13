import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { RecurringDetailPanel } from "@/components/recurring/recurring-detail-panel";
import { getRecurringItemById } from "@/lib/data/recurring";

type RecurringDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecurringDetailPage({
  params,
}: RecurringDetailPageProps) {
  const { id } = await params;
  const item = await getRecurringItemById(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={item.title}
        backHref="/settings/recurring"
        backLabel="Recurring"
      />
      <RecurringDetailPanel
        item={item}
        showTitle={false}
        redirectOnDelete="/settings/recurring"
      />
    </div>
  );
}
