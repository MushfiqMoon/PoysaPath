import { createClient } from "@/lib/supabase/server";

/** Auth guard for server actions — throws when the session is missing or invalid. */
export async function requireActionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be logged in.");
  }

  return { supabase, user };
}
