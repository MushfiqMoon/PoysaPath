import type { IconType } from "react-icons";
import { FiPieChart, FiPlusCircle, FiTrendingDown } from "react-icons/fi";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

type StatVariant = "income" | "expenses" | "saved";

const STAT_VARIANTS: Record<
  StatVariant,
  {
    Icon: IconType;
    shell: string;
    iconShell: string;
    accentBar: string;
    amountClass: string;
    labelDiamondClass: string;
  }
> = {
  income: {
    Icon: FiPlusCircle,
    shell: "border-income/30 bg-income/7",
    iconShell: "bg-income/15 text-income ring-income/25",
    accentBar: "bg-income",
    amountClass: "text-income",
    labelDiamondClass: "text-income/75",
  },
  expenses: {
    Icon: FiTrendingDown,
    shell: "border-expense/30 bg-expense/7",
    iconShell: "bg-expense/15 text-expense ring-expense/25",
    accentBar: "bg-expense",
    amountClass: "text-expense",
    labelDiamondClass: "text-expense/75",
  },
  saved: {
    Icon: FiPieChart,
    shell: "border-accent/25 bg-accent/5",
    iconShell: "bg-accent/12 text-accent ring-accent/20",
    accentBar: "bg-accent",
    amountClass: "text-accent",
    labelDiamondClass: "text-accent/75",
  },
};

type DashboardSummaryStatCardProps = {
  variant: StatVariant;
  label: string;
  amount: number;
  detail?: string;
};

function DashboardSummaryStatCard({
  variant,
  label,
  amount,
  detail,
}: DashboardSummaryStatCardProps) {
  const config = STAT_VARIANTS[variant];
  const Icon = config.Icon;
  const isDeficit = variant === "saved" && amount < 0;

  return (
    <Card
      elevated
      padding="none"
      className={[
        "relative min-w-0 overflow-hidden",
        isDeficit
          ? "border-danger/35 bg-danger/6"
          : config.shell,
      ].join(" ")}
    >
      <div
        className={[
          "h-1 w-full",
          isDeficit ? "bg-danger" : config.accentBar,
        ].join(" ")}
        aria-hidden
      />

      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-2.5">
          <span
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
              isDeficit ? "bg-danger/12 text-danger ring-danger/25" : config.iconShell,
            ].join(" ")}
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </span>
          <p className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-text-muted">
            <span className={config.labelDiamondClass} aria-hidden>
              ◇{" "}
            </span>
            {label}
          </p>
        </div>

        <p
          className={[
            "mt-3 text-xl font-bold tabular-nums tracking-tight sm:text-2xl",
            isDeficit ? "text-danger" : config.amountClass,
          ].join(" ")}
        >
          {formatCurrency(amount)}
        </p>

        {detail ? (
          <p className="mt-2 inline-flex max-w-full truncate rounded-full bg-surface/90 px-2.5 py-1 text-[0.6875rem] font-medium text-text-muted ring-1 ring-border/50 sm:text-xs">
            {detail}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

type DashboardSummaryStatsProps = {
  monthIncomeTotal: number;
  monthTotal: number;
  todayTotal: number;
  savedThisMonth: number;
};

export function DashboardSummaryStats({
  monthIncomeTotal,
  monthTotal,
  todayTotal,
  savedThisMonth,
}: DashboardSummaryStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3 md:gap-4">
      <DashboardSummaryStatCard
        variant="income"
        label="Income"
        amount={monthIncomeTotal}
        detail="This month"
      />
      <DashboardSummaryStatCard
        variant="expenses"
        label="Expenses"
        amount={monthTotal}
        detail={`Today ${formatCurrency(todayTotal)}`}
      />
      <DashboardSummaryStatCard
        variant="saved"
        label="Saved"
        amount={savedThisMonth}
        detail={savedThisMonth >= 0 ? "This month" : "Over budget this month"}
      />
    </div>
  );
}
