import { sha256Fingerprint, verifyPayload } from "./crypto";

export interface AgentPassportClaims {
  id: string;
  agentId: string;
  agentPublicKeyPem: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
}

export interface AgentPassport extends AgentPassportClaims {
  signature?: string;
  revoked?: boolean;
}

export interface PassportRegistry {
  issuerPublicKeys: Record<string, string>;
  revokedPassportIds?: ReadonlySet<string> | string[];
}

export type PassportValidationFailure =
  | "passport_malformed"
  | "passport_revoked"
  | "passport_expired"
  | "passport_unsigned"
  | "passport_unknown_issuer"
  | "passport_bad_signature";

export interface PassportValidationResult {
  ok: boolean;
  reason?: PassportValidationFailure;
  publicKeyFingerprint?: string;
}

const requiredStringFields: Array<keyof AgentPassportClaims> = [
  "id",
  "agentId",
  "agentPublicKeyPem",
  "issuer",
  "issuedAt",
  "expiresAt",
];

export function passportClaims(passport: AgentPassport): AgentPassportClaims {
  return {
    id: passport.id,
    agentId: passport.agentId,
    agentPublicKeyPem: passport.agentPublicKeyPem,
    issuer: passport.issuer,
    issuedAt: passport.issuedAt,
    expiresAt: passport.expiresAt,
  };
}

export function validateAgentPassport(
  passport: AgentPassport,
  registry: PassportRegistry,
  now: Date,
): PassportValidationResult {
  if (!passport || requiredStringFields.some((field) => typeof passport[field] !== "string")) {
    return { ok: false, reason: "passport_malformed" };
  }

  const revokedIds = registry.revokedPassportIds ?? [];
  const revoked = Array.isArray(revokedIds)
    ? revokedIds.includes(passport.id)
    : revokedIds.has(passport.id);
  if (passport.revoked || revoked) {
    return { ok: false, reason: "passport_revoked" };
  }

  if (Number.isNaN(Date.parse(passport.expiresAt)) || new Date(passport.expiresAt) <= now) {
    return { ok: false, reason: "passport_expired" };
  }

  if (!passport.signature) {
    return { ok: false, reason: "passport_unsigned" };
  }

  const issuerPublicKey = registry.issuerPublicKeys[passport.issuer];
  if (!issuerPublicKey) {
    return { ok: false, reason: "passport_unknown_issuer" };
  }

  if (!verifyPayload(passportClaims(passport), passport.signature, issuerPublicKey)) {
    return { ok: false, reason: "passport_bad_signature" };
  }

  return {
    ok: true,
    publicKeyFingerprint: sha256Fingerprint(passport.agentPublicKeyPem),
  };
}
