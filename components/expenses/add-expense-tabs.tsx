"use client";

import { useEffect, useState } from "react";

import { ExpenseForm } from "@/components/expenses/expense-form";
import { QuickAdd } from "@/components/expenses/quick-add";
import { Card } from "@/components/ui/card";
import { AI_LABELS } from "@/lib/gemini/labels";
import type { Category } from "@/lib/types";

const TAB_STORAGE_KEY = "poysapath-add-tab";

type Tab = "quick" | "manual";

const tabs: { value: Tab; label: string }[] = [
  { value: "quick", label: `${AI_LABELS.sparkle} ${AI_LABELS.quickTab}` },
  { value: "manual", label: "Manual" },
];

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
    const frame = window.requestAnimationFrame(() => {
      setTab(readStoredTab());
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function selectTab(next: Tab) {
    setTab(next);
    try {
      localStorage.setItem(TAB_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const activeIndex = Math.max(
    0,
    tabs.findIndex((item) => item.value === tab),
  );

  return (
    <div className="space-y-5">
      <Card
        padding="none"
        className="bg-bg/50 p-1.5"
        role="tablist"
        aria-label="Add expense mode"
      >
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 rounded-xl bg-accent transition-[transform] duration-300 ease-in-out motion-reduce:transition-none"
            style={{
              width: `${100 / tabs.length}%`,
              transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
            }}
            aria-hidden
          />
          <div className="relative z-10 grid grid-cols-2">
            {tabs.map((item) => {
              const active = tab === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectTab(item.value)}
                  className={[
                    "min-h-11 rounded-xl text-sm font-semibold transition-colors duration-300 motion-reduce:transition-none",
                    active ? "text-white" : "text-text-muted hover:text-text",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
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
