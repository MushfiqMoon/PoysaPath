import { getWeekStartInDhaka } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export async function getCachedInsight(
  userId: string,
  weekStart = getWeekStartInDhaka(),
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("insight_cache")
    .select("content")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    throw new Error(error.message);
  }

  return data?.content ?? null;
}

export async function saveInsightCache(
  userId: string,
  content: string,
  weekStart = getWeekStartInDhaka(),
) {
  const supabase = await createClient();
  const { error } = await supabase.from("insight_cache").upsert(
    {
      user_id: userId,
      week_start: weekStart,
      content,
    },
    { onConflict: "user_id,week_start" },
  );

  if (error) throw new Error(error.message);
}
