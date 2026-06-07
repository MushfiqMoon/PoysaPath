/** Supabase joins may return a single row object or a one-element array. */
export function unwrapSupabaseJoin<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}
