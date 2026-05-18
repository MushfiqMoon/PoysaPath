"use server";

import { revalidatePath } from "next/cache";

import {
  deleteGeminiKey,
  upsertGeminiKey,
} from "@/lib/data/gemini-credentials";
import { createClient } from "@/lib/supabase/server";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");
  return user.id;
}

export async function saveGeminiApiKey(apiKey: string) {
  const userId = await requireUserId();
  await upsertGeminiKey(userId, apiKey);
  revalidatePath("/settings");
  revalidatePath("/add");
  revalidatePath("/dashboard");
}

export async function removeGeminiApiKey() {
  const userId = await requireUserId();
  await deleteGeminiKey(userId);
  revalidatePath("/settings");
  revalidatePath("/add");
  revalidatePath("/dashboard");
}
