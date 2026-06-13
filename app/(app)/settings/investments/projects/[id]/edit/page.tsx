import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/investments/project-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getInvestmentProjectById } from "@/lib/data/investments";

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditInvestmentProjectPage({
  params,
}: EditProjectPageProps) {
  const { id } = await params;
  const project = await getInvestmentProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Edit project"
        description={project.title}
        backHref="/settings/investments"
        backLabel="Investments"
      />
      <Card padding="md">
        <ProjectForm project={project} />
      </Card>
    </div>
  );
}
