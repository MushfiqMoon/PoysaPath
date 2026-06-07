"use client";

import { Card } from "@/components/ui/card";
import { getKindTabPillClass } from "@/lib/ui/kind-tab-colors";
import type { CategoryKind } from "@/lib/types";

const tabs: { value: CategoryKind; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];

type KindPillTabsProps = {
  value: CategoryKind;
  onChange: (next: CategoryKind) => void;
  ariaLabel?: string;
};

export function KindPillTabs({
  value,
  onChange,
  ariaLabel = "Expense or income",
}: KindPillTabsProps) {
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
            getKindTabPillClass(value),
          ].join(" ")}
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
          }}
          aria-hidden
        />
        <div className="relative z-10 grid grid-cols-2">
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
