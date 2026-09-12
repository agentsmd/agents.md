import type { AgentPassport } from "./agent-passport";
import { DelegationSpendLedger } from "./budget";
import type { Delegation } from "./delegation";
import type { MerchantPolicyConfig } from "./merchant-policy";
import type { APSPreflightConfig } from "./preflight";

export const exampleMerchantAllowlist: MerchantPolicyConfig = {
  merchants: {
    "merchant_office_supply": {
      id: "merchant_office_supply",
      name: "Acme Office Supply",
      category: "office-supplies",
      allowed: true,
      riskLevel: "low",
    },
    "merchant_cloud_tools": {
      id: "merchant_cloud_tools",
      name: "Cloud Tools Inc.",
      category: "software",
      allowed: true,
      riskLevel: "low",
    },
    "merchant_denied_exchange": {
      id: "merchant_denied_exchange",
      name: "Denied Exchange",
      category: "crypto",
      allowed: false,
      riskLevel: "high",
    },
  },
};

export const exampleTestBudgetDelegation: Delegation = {
  id: "delegation_test_budget_001",
  humanPrincipalId: "human_principal_001",
  agentPassportId: "passport_agent_001",
  issuedAt: "2026-01-01T00:00:00.000Z",
  expiresAt: "2026-12-31T23:59:59.000Z",
  scope: {
    actions: ["commerce.payment"],
    maxSpendMinor: 50_000,
    currency: "USD",
    merchantCategories: ["office-supplies", "software"],
  },
  signature: "replace-with-human-principal-ed25519-signature",
};

export const exampleAgentPassport: AgentPassport = {
  id: "passport_agent_001",
  agentId: "agent_001",
  agentPublicKeyPem: "replace-with-agent-public-key-pem",
  issuer: "aps-passport-authority",
  issuedAt: "2026-01-01T00:00:00.000Z",
  expiresAt: "2026-12-31T23:59:59.000Z",
  signature: "replace-with-passport-authority-ed25519-signature",
};

export function createExampleAPSConfig(input: {
  issuerPublicKeyPem: string;
  principalPublicKeyPem: string;
  receiptPrivateKeyPem: string;
}): APSPreflightConfig {
  return {
    passportRegistry: {
      issuerPublicKeys: {
        "aps-passport-authority": input.issuerPublicKeyPem,
      },
    },
    delegationRegistry: {
      principalPublicKeys: {
        human_principal_001: input.principalPublicKeyPem,
      },
    },
    merchantPolicy: exampleMerchantAllowlist,
    receiptSigner: {
      keyId: "aps-receipt-signer-2026-01",
      privateKey: input.receiptPrivateKeyPem,
    },
    ledger: new DelegationSpendLedger(),
  };
}
