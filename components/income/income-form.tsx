"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  createIncome,
  deleteIncome,
  updateIncome,
} from "@/app/(app)/actions/incomes";
import { CategoryPicker } from "@/components/categories/category-picker";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DeleteDangerButton, SaveButton } from "@/components/ui/action-buttons";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  coercePaymentMethod,
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/constants";
import { getTodayInDhaka } from "@/lib/dates";
import type { Category, Income } from "@/lib/types";

type FormDefaults = {
  amount?: string;
  categoryId?: string;
  incomeDate?: string;
  note?: string;
  paymentMethod?: string;
};

type IncomeFormProps = {
  categories: Category[];
  income?: Income;
  redirectTo?: string;
  defaults?: FormDefaults;
  autoFocusAmount?: boolean;
};

export function IncomeForm({
  categories,
  income,
  redirectTo = "/history?tab=income",
  defaults,
  autoFocusAmount = false,
}: IncomeFormProps) {
  const router = useRouter();
  const isEdit = Boolean(income);
  const amountRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState(
    income ? String(income.amount) : (defaults?.amount ?? ""),
  );
  const [categoryId, setCategoryId] = useState(
    income?.category_id ??
      defaults?.categoryId ??
      categories[0]?.id ??
      "",
  );
  const [incomeDate, setIncomeDate] = useState(
    income?.income_date ?? defaults?.incomeDate ?? getTodayInDhaka(),
  );
  const [note, setNote] = useState(income?.note ?? defaults?.note ?? "");
  const [paymentMethod, setPaymentMethod] = useState(() => {
    const raw = income?.payment_method ?? defaults?.paymentMethod ?? "";
    return coercePaymentMethod(raw) ?? "";
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!autoFocusAmount) return;
    const t = window.setTimeout(() => amountRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [autoFocusAmount]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      amount: Number(amount),
      category_id: categoryId,
      income_date: incomeDate,
      note: note || null,
      payment_method: (paymentMethod || null) as PaymentMethod | null,
    };

    try {
      if (isEdit && income) {
        await updateIncome(income.id, payload);
      } else {
        await createIncome(payload);
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
    if (!income) return;
    setLoading(true);
    try {
      await deleteIncome(income.id);
      router.push("/history?tab=income");
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
      <section className="surface-card p-6 text-center">
        <p className="text-text-muted">
          No income categories yet. Run migration{" "}
          <code className="text-sm">022_incomes.sql</code> in Supabase, then
          refresh.
        </p>
      </section>
    );
  }

  return (
    <>
      <Card elevated padding="md">
        <form id="income-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="income-amount">Amount (৳)</Label>
            <Input
              ref={amountRef}
              id="income-amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="text-lg"
            />
          </div>

          <div>
            <CategoryPicker
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
            />
          </div>

          <div className="w-fit max-w-full">
            <Label htmlFor="income-date">Date</Label>
            <Input
              id="income-date"
              type="date"
              required
              value={incomeDate}
              onChange={(e) => setIncomeDate(e.target.value)}
              className="!w-auto min-w-44 max-w-full"
            />
          </div>

          <div>
            <Label htmlFor="income-note">Description / note</Label>
            <Input
              id="income-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. March salary"
            />
          </div>

          <div>
            <Label htmlFor="income-payment">Received via (optional)</Label>
            <select
              id="income-payment"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1.5 min-h-11 w-full appearance-none rounded-xl border border-border bg-surface px-3 py-2 text-base text-text transition-[background-image] duration-[var(--dur-short)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <option value="">—</option>
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
            <SaveButton
              type="submit"
              fullWidth
              size="default"
              loading={loading}
            >
              {isEdit ? "Save changes" : "Save income"}
            </SaveButton>
            {isEdit && (
              <DeleteDangerButton
                type="button"
                fullWidth
                disabled={loading}
                onClick={() => setConfirmDelete(true)}
              >
                Delete income
              </DeleteDangerButton>
            )}
          </div>
        </form>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete income?"
        message="This cannot be undone."
        loading={loading}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
