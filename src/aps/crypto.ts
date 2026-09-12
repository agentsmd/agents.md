import { createHash, sign, verify, type KeyObject } from "node:crypto";

export type PrivateSigningKey = string | KeyObject;
export type PublicSigningKey = string | KeyObject;

export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));

  return `{${entries
    .map(([key, entryValue]) => `${JSON.stringify(key)}:${canonicalize(entryValue)}`)
    .join(",")}}`;
}

export function signPayload(payload: unknown, privateKey: PrivateSigningKey): string {
  return sign(null, Buffer.from(canonicalize(payload)), privateKey).toString("base64url");
}

export function verifyPayload(
  payload: unknown,
  signature: string | undefined,
  publicKey: PublicSigningKey,
): boolean {
  if (!signature) {
    return false;
  }

  try {
    return verify(
      null,
      Buffer.from(canonicalize(payload)),
      publicKey,
      Buffer.from(signature, "base64url"),
    );
  } catch {
    return false;
  }
}

export function sha256Fingerprint(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256Hash(value: unknown): string {
  return createHash("sha256").update(canonicalize(value)).digest("hex");
}
