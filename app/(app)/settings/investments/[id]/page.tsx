import { notFound } from "next/navigation";

import { InvestmentProjectCard } from "@/components/investments/investment-project-card";
import { PageHeader } from "@/components/layout/page-header";
import { getInvestmentProjectById } from "@/lib/data/investments";

type InvestmentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InvestmentDetailPage({
  params,
}: InvestmentDetailPageProps) {
  const { id } = await params;
  const project = await getInvestmentProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={project.title}
        backHref="/settings/investments"
        backLabel="Investments"
      />
      <InvestmentProjectCard
        project={project}
        showTitle={false}
        redirectOnDelete="/settings/investments"
      />
    </div>
  );
}
