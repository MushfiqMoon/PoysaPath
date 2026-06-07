"use client";

import { useEffect, useState } from "react";

import { ExpenseForm } from "@/components/expenses/expense-form";
import { QuickAdd } from "@/components/expenses/quick-add";
import { IncomeForm } from "@/components/income/income-form";
import { KindPillTabs } from "@/components/shared/kind-pill-tabs";
import { Card } from "@/components/ui/card";
import { AI_LABELS } from "@/lib/gemini/labels";
import type { Category } from "@/lib/types";

const FLOW_STORAGE_KEY = "poysapath-add-flow";
const EXPENSE_TAB_STORAGE_KEY = "poysapath-add-tab";

type Flow = "expense" | "income";
type ExpenseTab = "quick" | "manual";

const expenseTabs: { value: ExpenseTab; label: string }[] = [
  { value: "quick", label: `${AI_LABELS.sparkle} ${AI_LABELS.quickTab}` },
  { value: "manual", label: "Manual" },
];

function readStoredFlow(): Flow {
  if (typeof window === "undefined") return "expense";
  try {
    const raw = localStorage.getItem(FLOW_STORAGE_KEY);
    if (raw === "expense" || raw === "income") return raw;
  } catch {
    /* ignore */
  }
  return "expense";
}

function readStoredExpenseTab(): ExpenseTab {
  if (typeof window === "undefined") return "manual";
  try {
    const raw = localStorage.getItem(EXPENSE_TAB_STORAGE_KEY);
    if (raw === "quick" || raw === "manual") return raw;
  } catch {
    /* ignore */
  }
  return "manual";
}

type AddMoneyTabsProps = {
  expenseCategories: Category[];
  incomeCategories: Category[];
  hasGeminiKey: boolean;
  initialFlow?: Flow;
};

function PillTabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
  activePillClass = "bg-accent",
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
  activePillClass?: string;
}) {
  const activeIndex = Math.max(
    0,
    tabs.findIndex((item) => item.value === value),
  );

  return (
    <Card
      padding="none"
      className="bg-bg/50 p-1.5"
      role="tablist"
      aria-label={ariaLabel}
    >
      <div className="relative">
        <div
          className={[
            "pointer-events-none absolute inset-y-0 left-0 rounded-xl transition-[transform] duration-300 ease-in-out motion-reduce:transition-none",
            activePillClass,
          ].join(" ")}
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
          }}
          aria-hidden
        />
        <div
          className="relative z-10 grid"
          style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
        >
          {tabs.map((item) => {
            const active = value === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange(item.value)}
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
  );
}

export function AddMoneyTabs({
  expenseCategories,
  incomeCategories,
  hasGeminiKey,
  initialFlow = "expense",
}: AddMoneyTabsProps) {
  const [flow, setFlow] = useState<Flow>(initialFlow);
  const [expenseTab, setExpenseTab] = useState<ExpenseTab>("manual");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setFlow(initialFlow === "income" ? "income" : readStoredFlow());
      setExpenseTab(readStoredExpenseTab());
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [initialFlow]);

  function selectFlow(next: Flow) {
    setFlow(next);
    try {
      localStorage.setItem(FLOW_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  function selectExpenseTab(next: ExpenseTab) {
    setExpenseTab(next);
    try {
      localStorage.setItem(EXPENSE_TAB_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-5">
      <KindPillTabs
        value={flow}
        onChange={selectFlow}
        ariaLabel="Add expense or income"
      />

      {hydrated && flow === "income" ? (
        <IncomeForm categories={incomeCategories} autoFocusAmount />
      ) : hydrated ? (
        <>
          <PillTabs
            tabs={expenseTabs}
            value={expenseTab}
            onChange={selectExpenseTab}
            ariaLabel="Add expense mode"
            activePillClass="bg-expense"
          />
          {expenseTab === "quick" ? (
            <QuickAdd categories={expenseCategories} hasGeminiKey={hasGeminiKey} />
          ) : (
            <ExpenseForm categories={expenseCategories} autoFocusAmount />
          )}
        </>
      ) : (
        <ExpenseForm categories={expenseCategories} />
      )}
    </div>
  );
}
