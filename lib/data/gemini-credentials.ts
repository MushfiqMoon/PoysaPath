import { decryptSecret, encryptSecret } from "@/lib/crypto/secrets";
import { createClient } from "@/lib/supabase/server";

export type GeminiKeyStatus = {
  hasKey: boolean;
  keyHint: string | null;
};

export async function getGeminiKeyStatus(
  userId: string,
): Promise<GeminiKeyStatus> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_gemini_credentials")
    .select("key_hint")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return { hasKey: false, keyHint: null };
    }
    throw new Error(error.message);
  }

  if (!data) {
    return { hasKey: false, keyHint: null };
  }

  return { hasKey: true, keyHint: data.key_hint };
}

export async function getDecryptedGeminiKey(
  userId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_gemini_credentials")
    .select("api_key_ciphertext")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    throw new Error(error.message);
  }

  if (!data?.api_key_ciphertext) return null;

  return decryptSecret(data.api_key_ciphertext);
}

function keyHintFromPlaintext(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length < 4) return "••••";
  return trimmed.slice(-4);
}

export async function upsertGeminiKey(userId: string, plainKey: string) {
  const trimmed = plainKey.trim();
  if (trimmed.length < 10) {
    throw new Error("API key looks too short.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("user_gemini_credentials").upsert(
    {
      user_id: userId,
      api_key_ciphertext: encryptSecret(trimmed),
      key_hint: keyHintFromPlaintext(trimmed),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) throw new Error(error.message);
}

export async function deleteGeminiKey(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_gemini_credentials")
    .delete()
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
