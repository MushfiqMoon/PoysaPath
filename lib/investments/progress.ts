import { formatCurrency } from "@/lib/format";
import type { InvestmentProject } from "@/lib/types";

export function getInvestmentPaidTotal(project: InvestmentProject): number {
  return project.payments.reduce((sum, p) => sum + Number(p.amount), 0);
}

export function getInvestmentProgressPercent(project: InvestmentProject): number {
  const paid = getInvestmentPaidTotal(project);
  if (project.kind === "one_time") {
    return paid > 0 ? 100 : 0;
  }
  const target = Number(project.target_amount ?? 0);
  if (target <= 0) return 0;
  return Math.min(100, Math.round((paid / target) * 100));
}

export function getInvestmentRemainingAmount(project: InvestmentProject): number {
  const paid = getInvestmentPaidTotal(project);
  const target = Number(project.target_amount ?? 0);
  if (project.kind !== "multi_payment" || target <= 0) return 0;
  return Math.max(0, target - paid);
}

export function getInvestmentProgressStatusLabel(
  project: InvestmentProject,
): string {
  if (project.kind === "one_time") {
    const payment = project.payments[0];
    return payment
      ? formatCurrency(Number(payment.amount))
      : formatCurrency(0);
  }
  const remaining = getInvestmentRemainingAmount(project);
  return `${formatCurrency(remaining)} left`;
}

export function getInvestmentKindLabel(kind: InvestmentProject["kind"]): string {
  return kind === "one_time" ? "One-time" : "Multi-payment";
}
