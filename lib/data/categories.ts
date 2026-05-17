import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export async function getUserCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, icon, sort_order")
    .not("user_id", "is", null)
    .order("sort_order");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Category[];
}
