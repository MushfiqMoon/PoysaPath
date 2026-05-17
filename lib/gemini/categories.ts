import type { Category } from "@/lib/types";

export function resolveCategoryId(
  name: string,
  categories: Category[],
): string | null {
  const normalized = name.trim().toLowerCase();
  const match = categories.find((c) => c.name.toLowerCase() === normalized);
  if (match) return match.id;

  const partial = categories.find(
    (c) =>
      normalized.includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(normalized),
  );
  return partial?.id ?? null;
}
