"use client";

import { useEffect, useState } from "react";

import { ExpenseForm } from "@/components/expense-form";
import { QuickAdd } from "@/components/quick-add";
import { Card } from "@/components/ui/card";
import { AI_LABELS } from "@/lib/gemini/labels";
import type { Category } from "@/lib/types";

const TAB_STORAGE_KEY = "poysapath-add-tab";

type Tab = "quick" | "manual";

function readStoredTab(): Tab {
  if (typeof window === "undefined") return "manual";
  try {
    const raw = localStorage.getItem(TAB_STORAGE_KEY);
    if (raw === "quick" || raw === "manual") return raw;
  } catch {
    /* ignore */
  }
  return "manual";
}

type AddExpenseTabsProps = {
  categories: Category[];
  hasGeminiKey: boolean;
};

export function AddExpenseTabs({ categories, hasGeminiKey }: AddExpenseTabsProps) {
  const [tab, setTab] = useState<Tab>("manual");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTab(readStoredTab());
    setHydrated(true);
  }, []);

  function selectTab(next: Tab) {
    setTab(next);
    try {
      localStorage.setItem(TAB_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-5">
      <Card
        padding="none"
        className="grid grid-cols-2 gap-1 p-1"
        role="tablist"
        aria-label="Add expense mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "quick"}
          onClick={() => selectTab("quick")}
          className={[
            "min-h-11 rounded-[calc(var(--radius-card)-4px)] text-sm font-semibold transition-[color,background-color] duration-[var(--dur-short)]",
            tab === "quick"
              ? "bg-accent text-white shadow-sm shadow-accent/20"
              : "text-text-muted hover:bg-bg hover:text-text",
          ].join(" ")}
        >
          {AI_LABELS.sparkle}{" "}{AI_LABELS.quickTab}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "manual"}
          onClick={() => selectTab("manual")}
          className={[
            "min-h-11 rounded-[calc(var(--radius-card)-4px)] text-sm font-semibold transition-[color,background-color] duration-[var(--dur-short)]",
            tab === "manual"
              ? "bg-accent text-white shadow-sm shadow-accent/20"
              : "text-text-muted hover:bg-bg hover:text-text",
          ].join(" ")}
        >
          Manual
        </button>
      </Card>

      {hydrated && tab === "quick" ? (
        <QuickAdd categories={categories} hasGeminiKey={hasGeminiKey} />
      ) : hydrated ? (
        <ExpenseForm categories={categories} autoFocusAmount />
      ) : (
        <ExpenseForm categories={categories} />
      )}
    </div>
  );
}
