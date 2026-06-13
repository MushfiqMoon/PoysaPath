"use client";

import { useRouter } from "next/navigation";
import { FiTarget } from "react-icons/fi";

import {
  deleteRecurringItem,
  recordRecurringExpense,
} from "@/app/(app)/actions/recurring";
import { DeleteButton } from "@/components/ui/action-buttons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompactActionLink } from "@/components/ui/compact-action";
import { useServerAction } from "@/lib/hooks/use-server-action";
import { formatPaymentMethod } from "@/lib/constants";
import { formatCurrency, formatRelativeDay } from "@/lib/format";
import type { RecurringFrequency, RecurringItem } from "@/lib/types";

const frequencyLabels: Record<RecurringFrequency, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

function statusLabel(item: RecurringItem) {
  if (!item.is_active) return "Paused";
  if (item.status === "missed") return "Missed";
  if (item.status === "due_soon") return "Due soon";
  return "Upcoming";
}

function LinkedGoalBanner({
  goalTitle,
  amount,
}: {
  goalTitle: string;
  amount: number;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 px-3 py-3 ring-1 ring-accent/15">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent"
        aria-hidden
      >
        <FiTarget className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-accent">
          Linked goal
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-text" title={goalTitle}>
          {goalTitle}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Each recorded payment adds{" "}
          <span className="font-semibold tabular-nums text-text">
            {formatCurrency(amount)}
          </span>{" "}
          toward this goal
        </p>
      </div>
      <CompactActionLink href="/settings/goals" variant="soft" size="xs" className="shrink-0">
        View
      </CompactActionLink>
    </div>
  );
}

function recordPaymentHintText(linkedGoalTitle: string | null, amount: number) {
  if (linkedGoalTitle) {
    return `Logs today's expense, marks this due date as paid, and adds ${formatCurrency(amount)} to ${linkedGoalTitle}.`;
  }
  return "Logs an expense for today and marks this due date as paid.";
}

type RecurringDetailPanelProps = {
  item: RecurringItem;
  showTitle?: boolean;
  redirectOnDelete?: string;
};

export function RecurringDetailPanel({
  item,
  showTitle = true,
  redirectOnDelete,
}: RecurringDetailPanelProps) {
  const router = useRouter();
  const { loading, error, runAction } = useServerAction("Could not update item");

  const statusClasses =
    item.status === "missed"
      ? "bg-danger/10 text-danger ring-1 ring-danger/20"
      : item.status === "due_soon"
        ? "bg-accent/12 text-accent ring-1 ring-accent/25"
        : "bg-bg/70 text-text-muted ring-1 ring-border/60";
  const statusBarClass =
    item.status === "missed"
      ? "bg-danger"
      : item.status === "due_soon"
        ? "bg-accent"
        : "bg-border";
  const duePanelClasses =
    item.status === "missed"
      ? "border-danger/35 bg-danger/10"
      : item.status === "due_soon"
        ? "border-accent/45 bg-accent/12"
        : "border-accent/30 bg-accent/8";
  const paymentLabel = formatPaymentMethod(item.payment_method) ?? "Not set";
  const canRecordPayment = item.recurring_type === "expense";

  async function handleDelete() {
    if (await runAction(() => deleteRecurringItem(item.id))) {
      if (redirectOnDelete) {
        router.push(redirectOnDelete);
      }
    }
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className={`h-1 ${statusBarClass}`} aria-hidden />
      <div className="space-y-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {showTitle ? (
                <p className="min-w-0 text-base font-semibold tracking-tight text-text sm:text-lg">
                  {item.title}
                </p>
              ) : null}
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses}`}
              >
                {statusLabel(item)}
              </span>
            </div>
            <div
              className={[
                "flex flex-wrap items-center gap-2 text-xs text-text-muted",
                showTitle ? "mt-2" : "",
              ].join(" ")}
            >
              <span className="rounded-full bg-bg/70 px-2.5 py-1">
                {item.recurring_type === "income"
                  ? "Income reminder"
                  : "Recurring payment"}
              </span>
              {item.category ? (
                <span className="rounded-full bg-bg/70 px-2.5 py-1">
                  {item.category.icon ? `${item.category.icon} ` : ""}
                  {item.category.name}
                </span>
              ) : null}
            </div>
          </div>

          <div
            className={`rounded-2xl border px-4 py-3 sm:min-w-44 sm:text-right ${duePanelClasses}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Next due
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-text sm:text-2xl">
              {formatRelativeDay(item.next_due_date)}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Reminds {item.reminder_days} days before
            </p>
          </div>
        </div>

        <dl className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-bg/50 p-3">
            <dt className="text-xs font-medium text-text-muted">Amount</dt>
            <dd className="mt-1 text-sm font-semibold text-text">
              {formatCurrency(item.amount)}
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-bg/50 p-3">
            <dt className="text-xs font-medium text-text-muted">Repeats</dt>
            <dd className="mt-1 text-sm font-semibold text-text">
              {frequencyLabels[item.frequency]}
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-bg/50 p-3">
            <dt className="text-xs font-medium text-text-muted">Payment</dt>
            <dd className="mt-1 text-sm font-semibold text-text">
              {paymentLabel}
            </dd>
          </div>
        </dl>

        {item.linked_goal ? (
          <LinkedGoalBanner
            goalTitle={item.linked_goal.title}
            amount={item.amount}
          />
        ) : null}

        {item.notes ? (
          <p className="rounded-xl border border-border bg-bg/50 px-3 py-2.5 text-sm text-text-muted">
            {item.notes}
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {canRecordPayment ? (
            <p className="min-w-0 flex-1 text-xs leading-relaxed text-text-muted">
              {recordPaymentHintText(item.linked_goal?.title ?? null, item.amount)}
            </p>
          ) : null}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:items-end">
            {canRecordPayment ? (
              <Button
                type="button"
                size="default"
                variant="primary"
                loading={loading}
                className="w-full font-semibold shadow-sm ring-2 ring-accent/30 sm:min-w-44 sm:w-auto"
                onClick={() => void runAction(() => recordRecurringExpense(item.id))}
              >
                Record payment
              </Button>
            ) : null}
            <DeleteButton
              type="button"
              disabled={loading}
              className="self-center sm:self-end"
              onClick={() => void handleDelete()}
            >
              Delete
            </DeleteButton>
          </div>
        </div>
      </div>
    </Card>
  );
}
