import type { Delegation } from "./delegation";

export interface MerchantPolicyEntry {
  id: string;
  name: string;
  category: string;
  allowed: boolean;
  riskLevel?: "low" | "medium" | "high";
}

export interface MerchantPolicyConfig {
  merchants: Record<string, MerchantPolicyEntry>;
}

export type MerchantFailure =
  | "merchant_unknown"
  | "merchant_denied"
  | "merchant_high_risk"
  | "merchant_category_mismatch";

export interface MerchantPolicyResult {
  ok: boolean;
  reason?: MerchantFailure;
  merchant?: MerchantPolicyEntry;
}

export function checkMerchantAllowed(
  merchantId: string,
  policy: MerchantPolicyConfig,
  delegation?: Delegation,
): MerchantPolicyResult {
  const merchant = policy.merchants[merchantId];
  if (!merchant) {
    return { ok: false, reason: "merchant_unknown" };
  }

  if (!merchant.allowed) {
    return { ok: false, reason: "merchant_denied", merchant };
  }

  if (merchant.riskLevel === "high") {
    return { ok: false, reason: "merchant_high_risk", merchant };
  }

  const allowedCategories = delegation?.scope.merchantCategories;
  if (allowedCategories?.length && !allowedCategories.includes(merchant.category)) {
    return { ok: false, reason: "merchant_category_mismatch", merchant };
  }

  return { ok: true, merchant };
}
