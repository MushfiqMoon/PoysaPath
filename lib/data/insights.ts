import { INSIGHT_REFRESH_COOLDOWN_MS } from "@/lib/constants";
import { getInsightCachePeriodKeyInDhaka } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export { INSIGHT_REFRESH_COOLDOWN_MS };

export async function getCachedInsight(
  userId: string,
  periodKey = getInsightCachePeriodKeyInDhaka(),
): Promise<string | null> {
  const record = await getInsightCacheRecord(userId, periodKey);
  return record?.content ?? null;
}

export async function getInsightCacheRecord(
  userId: string,
  periodKey = getInsightCachePeriodKeyInDhaka(),
): Promise<{ content: string; created_at: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("insight_cache")
    .select("content, created_at")
    .eq("user_id", userId)
    .eq("week_start", periodKey)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    throw new Error(error.message);
  }

  if (!data) return null;
  return { content: data.content, created_at: data.created_at };
}

export async function saveInsightCache(
  userId: string,
  content: string,
  periodKey = getInsightCachePeriodKeyInDhaka(),
) {
  const supabase = await createClient();
  const { error } = await supabase.from("insight_cache").upsert(
    {
      user_id: userId,
      week_start: periodKey,
      content,
    },
    { onConflict: "user_id,week_start" },
  );

  if (error) throw new Error(error.message);
}
