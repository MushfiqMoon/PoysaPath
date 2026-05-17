"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { Category } from "@/lib/types";

type ExpenseFiltersProps = {
  categories: Category[];
};

export function ExpenseFilters({ categories }: ExpenseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("category") ?? "";

  function onChange(categoryId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    router.push(`/expenses?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filter by category"
      className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text"
    >
      <option value="">All categories</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.icon ? `${c.icon} ` : ""}
          {c.name}
        </option>
      ))}
    </select>
  );
}
