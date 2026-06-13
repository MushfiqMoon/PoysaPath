"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";

import {
  createRecurringItem,
} from "@/app/(app)/actions/recurring";
import { EmptyState } from "@/components/shared/empty-state";
import { ResponsiveItemList } from "@/components/shared/responsive-item-list";
import { RecurringDetailPanel } from "@/components/recurring/recurring-detail-panel";
import { RecurringStackPreviewCard } from "@/components/recurring/recurring-stack-preview-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/constants";
import { getTodayInDhaka } from "@/lib/dates";
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
        <section className="space-y-4">
          <h2 className="hidden text-sm font-semibold text-text-muted md:block">
            Your recurring payments
          </h2>
          <ResponsiveItemList
            items={items}
            getItemId={(item) => item.id}
            label="recurring payments"
            onItemSelect={(item) =>
              router.push(`/settings/recurring/${item.id}`)
            }
            renderPeek={(item) => (
              <RecurringStackPreviewCard item={item} variant="peek" />
            )}
            renderFront={(item, { showHint, tapHint }) => (
              <RecurringStackPreviewCard
                item={item}
                variant="front"
                showHint={showHint}
                tapHint={tapHint}
              />
            )}
            renderDesktop={(item) => <RecurringDetailPanel item={item} />}
          />
        </section>
      )}
    </div>
  );
}
