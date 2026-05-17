"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
  createExpense,
  deleteExpense,
  updateExpense,
} from "@/app/(app)/actions/expenses";
import { CategoryPicker } from "@/components/category-picker";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatPaymentMethod,
  PAYMENT_METHODS,
  type StoredPaymentMethod,
} from "@/lib/constants";
import { getTodayInDhaka } from "@/lib/dates";
import type { Category, Expense } from "@/lib/types";

type FormDefaults = {
  amount?: string;
  categoryId?: string;
  expenseDate?: string;
  note?: string;
  paymentMethod?: string;
};

type ExpenseFormProps = {
  categories: Category[];
  expense?: Expense;
  redirectTo?: string;
  defaults?: FormDefaults;
  enableAutoCategorize?: boolean;
  highlightParsed?: boolean;
};

const parsedRing =
  "ring-2 ring-inset ring-accent/40 transition-shadow";

export function ExpenseForm({
  categories,
  expense,
  redirectTo = "/dashboard",
  defaults,
  enableAutoCategorize = false,
  highlightParsed = false,
}: ExpenseFormProps) {
  const router = useRouter();
  const isEdit = Boolean(expense);
  const categorizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [amount, setAmount] = useState(
    expense ? String(expense.amount) : (defaults?.amount ?? ""),
  );
  const [categoryId, setCategoryId] = useState(
    expense?.category_id ??
      defaults?.categoryId ??
      categories[0]?.id ??
      "",
  );
  const [expenseDate, setExpenseDate] = useState(
    expense?.expense_date ?? defaults?.expenseDate ?? getTodayInDhaka(),
  );
  const [note, setNote] = useState(expense?.note ?? defaults?.note ?? "");
  const [paymentMethod, setPaymentMethod] = useState(
    expense?.payment_method ?? defaults?.paymentMethod ?? "",
  );
  const [suggestingCategory, setSuggestingCategory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function suggestCategory(description: string) {
    if (!enableAutoCategorize || isEdit || description.trim().length < 3) {
      return;
    }

    setSuggestingCategory(true);
    try {
      const res = await fetch("/api/gemini/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.category_id) {
        setCategoryId(data.category_id);
      }
    } catch {
      // Non-blocking — user can pick category manually
    } finally {
      setSuggestingCategory(false);
    }
  }

  function handleNoteBlur() {
    if (categorizeTimer.current) clearTimeout(categorizeTimer.current);
    categorizeTimer.current = setTimeout(() => {
      suggestCategory(note);
    }, 600);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      amount: Number(amount),
      category_id: categoryId,
      expense_date: expenseDate,
      note: note || null,
      payment_method: (paymentMethod || null) as StoredPaymentMethod | null,
    };

    try {
      if (isEdit && expense) {
        await updateExpense(expense.id, payload);
      } else {
        await createExpense(payload);
      }
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!expense) return;
    setLoading(true);
    try {
      await deleteExpense(expense.id);
      router.push("/expenses");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  }

  if (categories.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6 text-center">
        <p className="text-text-muted">
          No categories yet. Run Supabase migrations and sign up again, or run
          the backfill script in{" "}
          <code className="text-sm">supabase/README.md</code>.
        </p>
      </section>
    );
  }

  return (
    <>
      <form
        id="expense-form"
        onSubmit={handleSubmit}
        className="min-w-0 space-y-4"
      >
        <div>
          <Label htmlFor="amount">Amount (৳)</Label>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="any"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className={[
              "text-lg",
              highlightParsed && amount ? parsedRing : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        </div>

        <div>
          <CategoryPicker
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
          />
          {suggestingCategory && (
            <p className="mt-1 text-xs text-text-muted">Suggesting category…</p>
          )}
          {enableAutoCategorize && !isEdit && (
            <p className="mt-1 text-xs text-text-muted">
              Category suggested when you leave the note field.
            </p>
          )}
        </div>

        <div className="min-w-0 max-w-full overflow-hidden">
          <Label htmlFor="expense-date">Date</Label>
          <Input
            id="expense-date"
            type="date"
            required
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className={[
              "min-w-0 max-w-full",
              highlightParsed ? parsedRing : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        </div>

        <div>
          <Label htmlFor="note">Description / note</Label>
          <Input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleNoteBlur}
            placeholder="e.g. lunch, bus fare"
            className={highlightParsed && note ? parsedRing : ""}
          />
        </div>

        <div>
          <Label htmlFor="payment">Payment (optional)</Label>
          <select
            id="payment"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-text"
          >
            <option value="">—</option>
            {paymentMethod &&
              !PAYMENT_METHODS.some((p) => p.value === paymentMethod) && (
                <option value={paymentMethod}>
                  {formatPaymentMethod(paymentMethod) ?? paymentMethod}
                </option>
              )}
            {PAYMENT_METHODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-3 pt-1">
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Save expense"}
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="danger"
              fullWidth
              disabled={loading}
              onClick={() => setConfirmDelete(true)}
            >
              Delete expense
            </Button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete expense?"
        message="This cannot be undone."
        loading={loading}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
