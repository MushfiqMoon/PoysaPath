import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

import { getEncryptionSecret } from "@/lib/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

function deriveKey(secret: string): Buffer {
  return scryptSync(secret, "poysapath-gemini-v1", KEY_LENGTH);
}

/** Encrypt plaintext; returns base64(iv + authTag + ciphertext). */
export function encryptSecret(plaintext: string): string {
  const key = deriveKey(getEncryptionSecret());
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/** Decrypt payload from encryptSecret. */
export function decryptSecret(ciphertext: string): string {
  const key = deriveKey(getEncryptionSecret());
  const data = Buffer.from(ciphertext, "base64");
  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = data.subarray(IV_LENGTH + 16);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}
