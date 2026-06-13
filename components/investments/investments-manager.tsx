"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMaximize2, FiMinimize2, FiTrendingUp } from "react-icons/fi";

import { EmptyState } from "@/components/shared/empty-state";
import { ResponsiveItemList } from "@/components/shared/responsive-item-list";
import { InvestmentCreateForm } from "@/components/investments/investment-create-form";
import { InvestmentProjectCard } from "@/components/investments/investment-project-card";
import { InvestmentStackPreviewCard } from "@/components/investments/investment-stack-preview-card";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { InvestmentProject } from "@/lib/types";

type InvestmentsManagerProps = {
  projects: InvestmentProject[];
  total: number;
};

export function InvestmentsManager({ projects, total }: InvestmentsManagerProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(projects.length === 0);

  useEffect(() => {
    if (projects.length === 0) setIsFormOpen(true);
  }, [projects.length]);

  return (
    <div className="space-y-4">
      <Card padding="md" className="border-accent/35 bg-accent/5">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent"
            aria-hidden
          >
            <FiTrendingUp className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-text-muted">Total contributed</p>
            <p className="text-2xl font-bold tabular-nums text-text">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <button
          type="button"
          aria-expanded={isFormOpen}
          aria-controls="investment-create-form"
          onClick={() => setIsFormOpen((open) => !open)}
          className="group flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left transition-[background-color] duration-(--dur-short) hover:bg-accent/6 active:bg-accent/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        >
          <span className="min-w-0">
            <span className="block font-semibold text-text">Add investment</span>
            <span className="mt-0.5 block text-sm text-text-muted">
              One-time contributions or multi-payment projects.
            </span>
          </span>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent transition-colors group-hover:bg-accent/18"
            aria-hidden
          >
            {isFormOpen ? (
              <FiMinimize2 className="h-4 w-4" />
            ) : (
              <FiMaximize2 className="h-4 w-4" />
            )}
          </span>
        </button>

        {isFormOpen ? (
          <div
            id="investment-create-form"
            className="border-t border-border/60 p-4"
          >
            <InvestmentCreateForm onCreated={() => setIsFormOpen(false)} />
          </div>
        ) : null}
      </Card>

      {projects.length === 0 ? (
        <EmptyState
          title="No investments yet"
          description="Add a one-time contribution or create a multi-payment project above."
        />
      ) : (
        <section className="space-y-4">
          <h2 className="hidden text-sm font-semibold text-text-muted md:block">
            Your investments
          </h2>
          <ResponsiveItemList
            items={projects}
            getItemId={(project) => project.id}
            label="investments"
            onItemSelect={(project) =>
              router.push(`/settings/investments/${project.id}`)
            }
            renderPeek={(project) => (
              <InvestmentStackPreviewCard project={project} variant="peek" />
            )}
            renderFront={(project, { showHint, tapHint }) => (
              <InvestmentStackPreviewCard
                project={project}
                variant="front"
                showHint={showHint}
                tapHint={tapHint}
              />
            )}
            renderDesktop={(project) => (
              <InvestmentProjectCard project={project} />
            )}
            desktopListClassName="space-y-4"
          />
        </section>
      )}
    </div>
  );
}
