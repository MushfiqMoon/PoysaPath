import { formatCurrency } from "@/lib/format";
import {
  getInvestmentProgressPercent,
  getInvestmentProgressStatusLabel,
} from "@/lib/investments/progress";
import type { InvestmentProject } from "@/lib/types";

type InvestmentProgressBarProps = {
  project: InvestmentProject;
};

export function InvestmentProgressBar({ project }: InvestmentProgressBarProps) {
  const progress = getInvestmentProgressPercent(project);
  const target = Number(project.target_amount ?? 0);

  return (
    <div className="rounded-2xl border border-border bg-bg/45 p-3">
      <div className="mb-2 flex items-end justify-between gap-3 text-xs text-text-muted">
        <span>Paid</span>
        <span className="text-right font-semibold tabular-nums text-text">
          {formatCurrency(project.paid_total)} / {formatCurrency(target)}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className="text-text-muted">{progress}% paid</span>
        <span className="text-text-muted">
          {getInvestmentProgressStatusLabel(project)}
        </span>
      </div>
    </div>
  );
}
