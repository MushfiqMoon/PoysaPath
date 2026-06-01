"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMaximize2, FiMinimize2, FiTarget } from "react-icons/fi";

import {
  createRecurringItem,
  deleteRecurringItem,
  recordRecurringExpense,
} from "@/app/(app)/actions/recurring";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteButton } from "@/components/ui/action-buttons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompactActionLink } from "@/components/ui/compact-action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatPaymentMethod,
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/constants";
import { getTodayInDhaka } from "@/lib/dates";
import { formatCurrency, formatRelativeDay } from "@/lib/format";
import type {
  Category,
  LinkableFinancialGoal,
  RecurringFrequency,
  RecurringItem,
} from "@/lib/types";

type RecurringManagerProps = {
  items: RecurringItem[];
  categories: Pick<Category, "id" | "name" | "icon">[];
  linkableGoals: LinkableFinancialGoal[];
};

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

function RecurringCard({ item }: { item: RecurringItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: () => Promise<void>) {
    setLoading(true);
    setError(null);
    try {
      await action();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update item");
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <Card padding="none" className="overflow-hidden">
      <div className={`h-1 ${statusBarClass}`} aria-hidden />
      <div className="space-y-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="min-w-0 text-base font-semibold tracking-tight text-text sm:text-lg">
                {item.title}
              </p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses}`}
              >
                {statusLabel(item)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-muted">
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
              onClick={() => void runAction(() => deleteRecurringItem(item.id))}
            >
              Delete
            </DeleteButton>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function RecurringManager({
  items,
  categories,
  linkableGoals,
}: RecurringManagerProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [linkedGoalId, setLinkedGoalId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [nextDueDate, setNextDueDate] = useState(getTodayInDhaka());
  const [reminderDays, setReminderDays] = useState("3");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(items.length === 0);

  useEffect(() => {
    if (items.length === 0) setIsFormOpen(true);
  }, [items.length]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createRecurringItem({
        title,
        recurring_type: "expense",
        amount: Number(amount),
        category_id: categoryId,
        payment_method: paymentMethod || null,
        frequency,
        next_due_date: nextDueDate,
        reminder_days: Number(reminderDays),
        notes: notes || null,
        linked_goal_id: linkedGoalId || null,
      });
      setTitle("");
      setAmount("");
      setNotes("");
      setLinkedGoalId("");
      setIsFormOpen(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create recurring item",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card padding="none" className="overflow-hidden">
        <button
          type="button"
          aria-expanded={isFormOpen}
          aria-controls="recurring-create-form"
          disabled={loading}
          onClick={() => {
            setError(null);
            setIsFormOpen((open) => !open);
          }}
          className="group flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left transition-[background-color] duration-(--dur-short) hover:bg-accent/6 active:bg-accent/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="min-w-0">
            <span className="block font-semibold text-text">
              Add recurring payment
            </span>
            <span className="mt-0.5 block text-sm text-text-muted">
              Rent, subscriptions, DPS installments, loans, or tuition.
            </span>
          </span>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-lg font-semibold text-accent transition-colors group-hover:bg-accent/18"
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
          <form
            id="recurring-create-form"
            onSubmit={handleCreate}
            className="space-y-4 border-t border-border/60 p-4"
          >
            <div>
              <Label htmlFor="recurring-title">Name</Label>
              <Input
                id="recurring-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Internet bill"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="recurring-amount">Amount (৳)</Label>
                <Input
                  id="recurring-amount"
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="recurring-category">Category</Label>
                <select
                  id="recurring-category"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-text"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon ? `${category.icon} ` : ""}
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="sm:flex-1">
                <Label htmlFor="recurring-frequency">Repeats</Label>
                <select
                  id="recurring-frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                  className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-text"
                >
                  {Object.entries(frequencyLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:flex-1">
                <Label htmlFor="recurring-due">Next due</Label>
                <Input
                  id="recurring-due"
                  type="date"
                  required
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                />
              </div>
              <div className="sm:flex-1">
                <Label htmlFor="recurring-reminder">Remind before (days)</Label>
                <Input
                  id="recurring-reminder"
                  type="number"
                  min="0"
                  max="30"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(e.target.value)}
                />
              </div>
            </div>

            {linkableGoals.length > 0 ? (
              <div>
                <Label htmlFor="recurring-goal">Link to goal (optional)</Label>
                <select
                  id="recurring-goal"
                  value={linkedGoalId}
                  onChange={(e) => setLinkedGoalId(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-text"
                >
                  <option value="">None</option>
                  {linkableGoals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-text-muted">
                  When you record this payment, progress is added to the goal as
                  well as logged as an expense.
                </p>
              </div>
            ) : null}

            <div>
              <Label htmlFor="recurring-payment">Payment (optional)</Label>
              <select
                id="recurring-payment"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod | "")
                }
                className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-text"
              >
                <option value="">Not set</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="recurring-notes">Notes (optional)</Label>
              <Input
                id="recurring-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. pay before the 10th"
              />
            </div>

            {error ? (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" fullWidth loading={loading}>
              Save recurring payment
            </Button>
          </form>
        ) : null}
      </Card>

      {items.length === 0 ? (
        <EmptyState
          title="No recurring items"
          description="Add fixed bills, subscriptions, or DPS installments so nothing important is missed."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <RecurringCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
