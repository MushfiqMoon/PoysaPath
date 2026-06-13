import { notFound } from "next/navigation";

import { GoalDetailPanel } from "@/components/goals/goal-detail-panel";
import { PageHeader } from "@/components/layout/page-header";
import { getFinancialGoalById } from "@/lib/data/goals";

type GoalDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params;
  const goal = await getFinancialGoalById(id);

  if (!goal) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={goal.title}
        backHref="/settings/goals"
        backLabel="Goals"
      />
      <GoalDetailPanel goal={goal} showTitle={false} />
    </div>
  );
}
