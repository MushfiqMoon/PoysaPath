"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  FiCalendar,
  FiChevronDown,
  FiCreditCard,
  FiFilter,
  FiTag,
  FiX,
} from "react-icons/fi";

import { PAYMENT_METHODS } from "@/lib/constants";
import type { Category } from "@/lib/types";

const LEGACY_PAYMENT_FILTERS = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "card", label: "Card" },
] as const;

export type MonthOption = {
  value: string;
  label: string;
};

type ExpenseFiltersProps = {
  categories: Category[];
  months: MonthOption[];
};

type FilterFieldProps = {
  label: string;
  icon: typeof FiCalendar;
  active?: boolean;
  className?: string;
  children: ReactNode;
};

function FilterField({
  label,
  icon: Icon,
  active = false,
  className = "",
  children,
}: FilterFieldProps) {
  return (
    <div
      className={[
        "min-w-0",
        active ? "rounded-xl ring-1 ring-accent/35" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-muted">
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {label}
      </span>
      <div className="relative">{children}</div>
    </div>
  );
}

const selectClass =
  "min-h-11 w-full appearance-none rounded-xl border border-border bg-surface py-2 pl-3 pr-9 text-sm text-text transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function ExpenseFilters({ categories, months }: ExpenseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultMonth = months[0]?.value ?? "";
  const month = searchParams.get("month") ?? defaultMonth;
  const category = searchParams.get("category") ?? "";
  const payment = searchParams.get("payment") ?? "";
  const hasMoreFilters =
    (Boolean(defaultMonth) && month !== defaultMonth) || Boolean(payment);
  const [moreOpen, setMoreOpen] = useState(hasMoreFilters);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const isCurrentMonth = key === "month" && value === defaultMonth;

    if (isCurrentMonth || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/expenses?${params.toString()}`);
  }

  function clearMoreFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("payment");
    params.delete("month");
    router.push(`/expenses?${params.toString()}`);
  }

  return (
    <section
      aria-label="Expense filters"
      className="glass-panel rounded-2xl border p-3 sm:p-4"
    >
      <div className="flex items-end gap-2">
        <FilterField
          label="Category"
          icon={FiTag}
          active={Boolean(category)}
          className="min-w-0 flex-1"
        >
          <select
            value={category}
            onChange={(e) => updateParam("category", e.target.value)}
            aria-label="Filter by category"
            className={[
              selectClass,
              category ? "border-accent/40 bg-accent/5" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ""}
                {c.name}
              </option>
            ))}
          </select>
          <FiChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
        </FilterField>

        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          aria-expanded={moreOpen}
          aria-controls="expense-more-filters"
          className={[
            "relative inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-[color,background-color,box-shadow] duration-[var(--dur-short)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            moreOpen || hasMoreFilters
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-border bg-surface text-text hover:bg-bg",
          ].join(" ")}
        >
          <FiFilter className="h-4 w-4 shrink-0" aria-hidden />
          More
          {hasMoreFilters && !moreOpen ? (
            <span
              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-surface"
              aria-hidden
            />
          ) : null}
        </button>
      </div>

      {moreOpen ? (
        <div
          id="expense-more-filters"
          className="mt-3 space-y-3 border-t border-border pt-3"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              More filters
            </p>
            {hasMoreFilters ? (
              <button
                type="button"
                onClick={clearMoreFilters}
                className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <FiX className="h-3.5 w-3.5" aria-hidden />
                Clear
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FilterField
              label="Period"
              icon={FiCalendar}
              active={Boolean(defaultMonth) && month !== defaultMonth}
            >
              <select
                value={month}
                onChange={(e) => updateParam("month", e.target.value)}
                aria-label="Filter by month"
                className={selectClass}
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <FiChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                aria-hidden
              />
            </FilterField>

            <FilterField
              label="Payment"
              icon={FiCreditCard}
              active={Boolean(payment)}
            >
              <select
                value={payment}
                onChange={(e) => updateParam("payment", e.target.value)}
                aria-label="Filter by payment type"
                className={[
                  selectClass,
                  payment ? "border-accent/40 bg-accent/5" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <option value="">All payment types</option>
                {PAYMENT_METHODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
                {LEGACY_PAYMENT_FILTERS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <FiChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                aria-hidden
              />
            </FilterField>
          </div>
        </div>
      ) : null}
    </section>
  );
}
