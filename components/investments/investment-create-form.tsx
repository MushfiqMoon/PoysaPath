"use client";

import { useState } from "react";

import {
  createMultiPaymentProject,
  createOneTimeInvestment,
} from "@/app/(app)/actions/investments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTodayInDhaka } from "@/lib/dates";
import type { InvestmentKind } from "@/lib/types";

type InvestmentCreateFormProps = {
  onCreated?: () => void;
};

export function InvestmentCreateForm({ onCreated }: InvestmentCreateFormProps) {
  const [kind, setKind] = useState<InvestmentKind>("one_time");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(getTodayInDhaka);
  const [paymentNote, setPaymentNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleKindChange(next: InvestmentKind) {
    setKind(next);
    setAmount("");
    setTargetAmount("");
    setPaymentDate(getTodayInDhaka());
    setPaymentNote("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (kind === "one_time") {
        await createOneTimeInvestment({
          title,
          description: description.trim() || null,
          amount: Number(amount),
          payment_date: paymentDate,
          payment_note: paymentNote.trim() || null,
        });
      } else {
        await createMultiPaymentProject({
          title,
          description: description.trim() || null,
          target_amount: Number(targetAmount),
        });
      }

      setTitle("");
      setDescription("");
      setAmount("");
      setTargetAmount("");
      setPaymentDate(getTodayInDhaka());
      setPaymentNote("");
      onCreated?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create investment",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="investment-kind">Investment type</Label>
        <select
          id="investment-kind"
          value={kind}
          onChange={(e) => handleKindChange(e.target.value as InvestmentKind)}
          className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-text"
        >
          <option value="one_time">One-time</option>
          <option value="multi_payment">Multi-payment</option>
        </select>
        <p className="mt-1.5 text-xs text-text-muted">
          {kind === "one_time"
            ? "For bonds, DPS, FDR, or other single contributions."
            : "For projects paid in steps, like building or land."}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="investment-title">Title</Label>
        <Input
          id="investment-title"
          type="text"
          placeholder={
            kind === "one_time" ? "e.g. 5-year DPS" : "e.g. Building – Mirpur"
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="investment-description">
          Description{" "}
          <span className="font-normal text-text-muted">(optional)</span>
        </Label>
        <Input
          id="investment-description"
          type="text"
          placeholder="Project or account details"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
      </div>

      {kind === "one_time" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="investment-amount">Amount (৳)</Label>
            <Input
              id="investment-amount"
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
            <Label htmlFor="investment-payment-date">Date</Label>
            <Input
              id="investment-payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment-payment-note">
              Payment note{" "}
              <span className="font-normal text-text-muted">(optional)</span>
            </Label>
            <Input
              id="investment-payment-note"
              type="text"
              placeholder="e.g. Opening deposit"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              maxLength={500}
            />
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="investment-target">Target amount (৳)</Label>
          <Input
            id="investment-target"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
          <p className="text-xs text-text-muted">
            Add individual payments from the project card after creating it.
          </p>
        </div>
      )}

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={loading} className="w-full">
        {kind === "one_time" ? "Add investment" : "Create project"}
      </Button>
    </form>
  );
}
