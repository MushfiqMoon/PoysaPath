import { InvestmentProgressBar } from "@/components/investments/investment-progress-bar";
import { StackPeekStrip } from "@/components/shared/stack-peek-strip";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatRelativeDay } from "@/lib/format";
import { getInvestmentKindLabel } from "@/lib/investments/progress";
import type { InvestmentProject } from "@/lib/types";

type InvestmentStackPreviewCardProps = {
  project: InvestmentProject;
  variant: "peek" | "front";
  showHint?: boolean;
  tapHint?: string;
};

export function InvestmentStackPreviewCard({
  project,
  variant,
  showHint = false,
  tapHint = "Swipe to browse",
}: InvestmentStackPreviewCardProps) {
  const isActive = project.status === "active";
  const isOneTime = project.kind === "one_time";
  const payment = project.payments[0];

  if (variant === "peek") {
    return (
      <StackPeekStrip
        title={project.title}
        meta={getInvestmentKindLabel(project.kind)}
        accent={isActive}
      />
    );
  }

  return (
    <Card
      padding="none"
      className={[
        "pointer-events-none w-full overflow-hidden shadow-[0_8px_28px_rgba(0,0,0,0.08)]",
        isActive ? "border-accent/40 shadow-[0_8px_28px_rgba(15,185,177,0.12)]" : "",
      ].join(" ")}
    >
      {isActive ? <div className="h-1 bg-accent" aria-hidden /> : null}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight text-text">
              {project.title}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              <span className="rounded-full bg-bg/70 px-2 py-0.5">
                {getInvestmentKindLabel(project.kind)}
              </span>
              <span className="ml-2 capitalize">{project.status}</span>
            </p>
          </div>
          {isOneTime && payment ? (
            <span className="shrink-0 text-sm font-semibold tabular-nums text-text">
              {formatCurrency(Number(payment.amount))}
            </span>
          ) : null}
        </div>

        {!isOneTime ? <InvestmentProgressBar project={project} /> : null}

        {isOneTime && payment ? (
          <p className="text-xs text-text-muted">
            Paid {formatRelativeDay(payment.payment_date)}
          </p>
        ) : null}

        {showHint ? (
          <p className="text-center text-xs text-text-muted">{tapHint}</p>
        ) : null}
      </div>
    </Card>
  );
}
