"use server";

import { revalidatePath } from "next/cache";

import { requireActionUser } from "@/lib/auth/action-user";
import {
  deleteGeminiKey,
  upsertGeminiKey,
} from "@/lib/data/gemini-credentials";

export async function saveGeminiApiKey(apiKey: string) {
  const { user } = await requireActionUser();
  await upsertGeminiKey(user.id, apiKey);
  revalidatePath("/settings");
  revalidatePath("/add");
  revalidatePath("/dashboard");
}

export async function removeGeminiApiKey() {
  const { user } = await requireActionUser();
  await deleteGeminiKey(user.id);
  revalidatePath("/settings");
  revalidatePath("/add");
  revalidatePath("/dashboard");
}
