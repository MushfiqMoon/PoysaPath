"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  addInvestmentPayment,
  deleteInvestmentPayment,
  updateInvestmentPayment,
} from "@/app/(app)/actions/investments";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  DeleteDangerButton,
  FormSaveActions,
  SaveButton,
} from "@/components/ui/action-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTodayInDhaka } from "@/lib/dates";
import type { InvestmentPayment, InvestmentProject } from "@/lib/types";

type PaymentFormProps = {
  projectId?: string;
  payment?: InvestmentPayment;
  project?: InvestmentProject;
  redirectTo?: string;
  onAdded?: () => void;
  compact?: boolean;
};

export function PaymentForm({
  projectId,
  payment,
  project,
  redirectTo = "/settings/investments",
  onAdded,
  compact = false,
}: PaymentFormProps) {
  const router = useRouter();
  const isEdit = Boolean(payment);
  const resolvedProjectId = projectId ?? payment?.project_id;

  const [amount, setAmount] = useState(
    payment ? String(payment.amount) : "",
  );
  const [paymentDate, setPaymentDate] = useState(
    payment?.payment_date ?? getTodayInDhaka(),
  );
  const [note, setNote] = useState(payment?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resolvedProjectId && !isEdit) return;

    setLoading(true);
    setError(null);

    const payload = {
      amount: Number(amount),
      payment_date: paymentDate,
      note: note.trim() || null,
    };

    try {
      if (isEdit && payment) {
        await updateInvestmentPayment(payment.id, payload);
        router.push(redirectTo);
        router.refresh();
      } else if (resolvedProjectId) {
        await addInvestmentPayment(resolvedProjectId, payload);
        setAmount("");
        setNote("");
        setPaymentDate(getTodayInDhaka());
        onAdded?.();
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save payment");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!payment) return;
    setLoading(true);
    try {
      await deleteInvestmentPayment(payment.id);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete payment");
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={compact ? "space-y-3" : "space-y-4"}
      >
        {isEdit && project ? (
          <p className="text-sm text-text-muted">
            Project: <span className="font-medium text-text">{project.title}</span>
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor={compact ? "inline-payment-amount" : "payment-amount"}>
            Amount (৳)
          </Label>
          <Input
            id={compact ? "inline-payment-amount" : "payment-amount"}
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={compact ? "inline-payment-date" : "payment-date"}>
            Date
          </Label>
          <Input
            id={compact ? "inline-payment-date" : "payment-date"}
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={compact ? "inline-payment-note" : "payment-note"}>
            Note <span className="font-normal text-text-muted">(optional)</span>
          </Label>
          <Input
            id={compact ? "inline-payment-note" : "payment-note"}
            type="text"
            placeholder="e.g. Foundation work"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
          />
        </div>

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <FormSaveActions>
          <SaveButton type="submit" loading={loading} size={compact ? "sm" : "default"}>
            {isEdit ? "Save changes" : "Add payment"}
          </SaveButton>
          {isEdit ? (
            <DeleteDangerButton
              type="button"
              onClick={() => setConfirmDelete(true)}
            >
              Delete payment
            </DeleteDangerButton>
          ) : null}
        </FormSaveActions>
      </form>

      {isEdit ? (
        <ConfirmDialog
          open={confirmDelete}
          title="Delete payment?"
          message="This payment will be removed from the project history."
          loading={loading}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  );
}
