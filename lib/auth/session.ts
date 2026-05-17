import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/** Deduped per request — avoids repeated Supabase auth calls on the same page. */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getDisplayName = cache(async () => {
  const user = await getAuthUser();
  if (!user) return "there";

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.display_name) return profile.display_name;
  return user.email?.split("@")[0] ?? "there";
});
