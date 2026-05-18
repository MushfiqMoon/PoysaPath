"use client";

import { useState } from "react";

import { ExpenseForm } from "@/components/expense-form";
import { QuickAdd } from "@/components/quick-add";
import { AI_LABELS } from "@/lib/gemini/labels";
import type { Category } from "@/lib/types";

type Tab = "quick" | "manual";

type AddExpenseTabsProps = {
  categories: Category[];
  hasGeminiKey: boolean;
};

export function AddExpenseTabs({ categories, hasGeminiKey }: AddExpenseTabsProps) {
  const [tab, setTab] = useState<Tab>("manual");

  return (
    <div className="space-y-4">
      <div
        className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface p-1"
        role="tablist"
        aria-label="Add expense mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "quick"}
          onClick={() => setTab("quick")}
          className={[
            "min-h-11 rounded-lg text-sm font-medium transition-colors",
            tab === "quick"
              ? "bg-accent text-white"
              : "text-text-muted hover:text-text",
          ].join(" ")}
        >
          ✨ {AI_LABELS.quickTab}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "manual"}
          onClick={() => setTab("manual")}
          className={[
            "min-h-11 rounded-lg text-sm font-medium transition-colors",
            tab === "manual"
              ? "bg-accent text-white"
              : "text-text-muted hover:text-text",
          ].join(" ")}
        >
          Manual
        </button>
      </div>

      {tab === "quick" ? (
        <QuickAdd categories={categories} hasGeminiKey={hasGeminiKey} />
      ) : (
        <ExpenseForm categories={categories} />
      )}
    </div>
  );
}
