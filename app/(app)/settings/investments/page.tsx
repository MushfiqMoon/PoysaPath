import { InvestmentsManager } from "@/components/investments/investments-manager";
import { PageHeader } from "@/components/layout/page-header";
import {
  getInvestmentGrandTotal,
  getInvestmentProjects,
} from "@/lib/data/investments";

export default async function SettingsInvestmentsPage() {
  const [projects, total] = await Promise.all([
    getInvestmentProjects(),
    getInvestmentGrandTotal(),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Investments"
        description="One-time contributions and multi-payment projects"
        backHref="/settings"
        backLabel="Settings"
      />
      <InvestmentsManager projects={projects} total={total} />
    </div>
  );
}
