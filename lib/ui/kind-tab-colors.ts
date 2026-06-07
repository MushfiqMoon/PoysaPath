import type { CategoryKind } from "@/lib/types";

export const KIND_TAB_PILL_CLASS: Record<CategoryKind, string> = {
  expense: "bg-expense",
  income: "bg-income",
};

export function getKindTabPillClass(kind: CategoryKind): string {
  return KIND_TAB_PILL_CLASS[kind];
}
