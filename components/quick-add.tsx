"use client";

import { useState } from "react";

import { AiDisabledNotice } from "@/components/ai-disabled-notice";
import { ExpenseForm } from "@/components/expense-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { isGeminiKeyRequiredResponse } from "@/lib/gemini/disabled-message";
import { AI_LABELS } from "@/lib/gemini/labels";
import type { Category } from "@/lib/types";

type ParsedExpense = {
  amount: number;
  category_id: string;
  category: string;
  note: string | null;
  expense_date: string;
};

type QuickAddProps = {
  categories: Category[];
  hasGeminiKey: boolean;
};

export function QuickAdd({ categories, hasGeminiKey }: QuickAddProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [keyRequired, setKeyRequired] = useState(!hasGeminiKey);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedExpense | null>(null);

  async function handleParse() {
    if (!hasGeminiKey) {
      setKeyRequired(true);
      return;
    }

    setError(null);
    setKeyRequired(false);
    setParsing(true);
    try {
      const res = await fetch("/api/gemini/parse-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (isGeminiKeyRequiredResponse(data)) {
          setKeyRequired(true);
          return;
        }
        setError(data.error ?? "Could not parse. Try manual entry.");
        return;
      }
      setParsed(data as ParsedExpense);
    } catch {
      setError("Network error. Try again or use manual entry.");
    } finally {
      setParsing(false);
    }
  }

  if (parsed) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-text-muted">
          Preview — edit if needed, then save.
        </p>
        <ExpenseForm
          key={`${parsed.category_id}-${parsed.amount}-${parsed.expense_date}`}
          categories={categories}
          defaults={{
            amount: String(parsed.amount),
            categoryId: parsed.category_id,
            expenseDate: parsed.expense_date,
            note: parsed.note ?? "",
          }}
          highlightParsed
        />
        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={() => {
            setParsed(null);
            setText("");
          }}
        >
          {AI_LABELS.parseAnother}
        </Button>
      </div>
    );
  }

  if (keyRequired) {
    return <AiDisabledNotice />;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="quick-text">Describe your expense</Label>
        <textarea
          id="quick-text"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='e.g. "120 lunch hotel" or "50 taka bus"'
          className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-text placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        <p className="mt-1.5 text-xs text-text-muted">
          English, Bangla, or Banglish · e.g. 120 lunch, 50 taka bus
        </p>
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}{" "}
          <span className="text-text-muted">
            Switch to the Manual tab to enter by hand.
          </span>
        </p>
      )}

      <Button
        type="button"
        fullWidth
        disabled={parsing || text.trim().length < 2}
        onClick={() => void handleParse()}
      >
        {parsing ? "Parsing…" : AI_LABELS.parse}
      </Button>

      <p className="text-center text-xs text-text-muted">
        {AI_LABELS.parseFooter}
      </p>
    </div>
  );
}
