"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import {
  FiCalendar,
  FiChevronDown,
  FiCreditCard,
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
  const hasSecondaryFilters = Boolean(category || payment);

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

  function clearSecondaryFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("payment");
    router.push(`/expenses?${params.toString()}`);
  }

  return (
    <section
      aria-label="Expense filters"
      className="glass-panel rounded-2xl border p-3 sm:p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Filters
        </p>
        {hasSecondaryFilters && (
          <button
            type="button"
            onClick={clearSecondaryFilters}
            className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <FiX className="h-3.5 w-3.5" aria-hidden />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <FilterField
          label="Period"
          icon={FiCalendar}
          className="sm:col-span-2 lg:col-span-1"
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

        <FilterField label="Category" icon={FiTag} active={Boolean(category)}>
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

        <FilterField label="Payment" icon={FiCreditCard} active={Boolean(payment)}>
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
    </section>
  );
}
