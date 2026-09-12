import { randomUUID } from "node:crypto";
import { validateAgentPassport, type AgentPassport, type PassportRegistry } from "./agent-passport";
import { createReceiptBody, signActionReceipt, type ActionReceipt, type GateResult, type PaymentDecision, type ReceiptSigner } from "./action-receipt";
import { DelegationSpendLedger } from "./budget";
import { authorizeDelegationScope, type CommerceAction, type Delegation, type DelegationRegistry } from "./delegation";
import { checkMerchantAllowed, type MerchantPolicyConfig } from "./merchant-policy";

export interface PaymentRequest {
  action: CommerceAction;
  amountMinor: number;
  currency: string;
  merchantId: string;
}

export interface APSPreflightConfig {
  passportRegistry: PassportRegistry;
  delegationRegistry: DelegationRegistry;
  merchantPolicy: MerchantPolicyConfig;
  receiptSigner: ReceiptSigner;
  ledger: DelegationSpendLedger;
  now?: Date;
}

export interface APSPreflightInput {
  passport: AgentPassport;
  delegationChain: Delegation[];
  payment: PaymentRequest;
}

export interface APSPreflightResult {
  decision: PaymentDecision;
  approved: boolean;
  receipt: ActionReceipt;
  gateResults: GateResult[];
  delegation?: Delegation;
}

export interface PaymentProcessorResult {
  id: string;
}

export type PaymentProcessor = (request: PaymentRequest, preflight: APSPreflightResult) => Promise<PaymentProcessorResult>;

function blockedBy(reason: string, gate: GateResult["gate"]): GateResult {
  return { gate, passed: false, reason };
}

function passed(gate: GateResult["gate"]): GateResult {
  return { gate, passed: true };
}

export async function runAPSPreflight(
  input: APSPreflightInput,
  config: APSPreflightConfig,
): Promise<APSPreflightResult> {
  const now = config.now ?? new Date();
  const gateResults: GateResult[] = [];
  const leafDelegation = input.delegationChain.at(-1);
  let decision: PaymentDecision = "ALLOW";
  let agentPublicKeyFingerprint: string | undefined;
  let delegationChainHash: string | undefined;

  const passportResult = validateAgentPassport(input.passport, config.passportRegistry, now);
  if (!passportResult.ok) {
    gateResults.push(blockedBy(passportResult.reason ?? "passport_invalid", "passport"));
    decision = "BLOCK";
  } else {
    agentPublicKeyFingerprint = passportResult.publicKeyFingerprint;
    gateResults.push(passed("passport"));
  }

  if (decision === "ALLOW") {
    const scopeResult = authorizeDelegationScope({
      delegationChain: input.delegationChain,
      registry: config.delegationRegistry,
      agentPassportId: input.passport.id,
      action: input.payment.action,
      amountMinor: input.payment.amountMinor,
      currency: input.payment.currency,
      now,
    });

    if (!scopeResult.ok) {
      gateResults.push(blockedBy(scopeResult.reason ?? "scope_denied", "scope"));
      decision = "BLOCK";
    } else {
      delegationChainHash = scopeResult.chainHash;
      gateResults.push(passed("scope"));
    }
  }

  if (decision === "ALLOW" && leafDelegation) {
    const budgetResult = config.ledger.checkRemaining({
      delegationId: leafDelegation.id,
      requestedAmountMinor: input.payment.amountMinor,
      maxSpendMinor: leafDelegation.scope.maxSpendMinor,
      currency: input.payment.currency,
      expectedCurrency: leafDelegation.scope.currency,
    });

    if (!budgetResult.ok) {
      gateResults.push(blockedBy(budgetResult.reason ?? "budget_denied", "budget"));
      decision = "BLOCK";
    } else {
      gateResults.push(passed("budget"));
    }
  }

  if (decision === "ALLOW") {
    const merchantResult = checkMerchantAllowed(input.payment.merchantId, config.merchantPolicy, leafDelegation);
    if (!merchantResult.ok) {
      gateResults.push(blockedBy(merchantResult.reason ?? "merchant_denied", "merchant"));
      decision = "BLOCK";
    } else {
      gateResults.push(passed("merchant"));
    }
  }

  if (decision === "ALLOW" && leafDelegation) {
    config.ledger.recordApprovedSpend(leafDelegation.id, input.payment.amountMinor);
  }

  config.ledger.recordAttempt({
    id: `attempt_${randomUUID()}`,
    delegationId: leafDelegation?.id ?? "unknown",
    amountMinor: input.payment.amountMinor,
    currency: input.payment.currency,
    merchantId: input.payment.merchantId,
    decision,
    timestamp: now.toISOString(),
    reason: gateResults.find((gate) => !gate.passed)?.reason,
  });

  const receipt = signActionReceipt(
    createReceiptBody({
      timestamp: now.toISOString(),
      agentPassportId: input.passport.id,
      agentPublicKeyFingerprint,
      humanPrincipalId: leafDelegation?.humanPrincipalId,
      delegationId: leafDelegation?.id,
      delegationChainHash,
      merchantId: input.payment.merchantId,
      amount: {
        amountMinor: input.payment.amountMinor,
        currency: input.payment.currency,
      },
      gateResults,
      decision,
    }),
    config.receiptSigner,
  );

  return {
    decision,
    approved: decision === "ALLOW",
    receipt,
    gateResults,
    delegation: leafDelegation,
  };
}

export async function processAgentPaymentAfterAPS(input: {
  preflight: APSPreflightResult;
  payment: PaymentRequest;
  processor: PaymentProcessor;
  receiptSigner: ReceiptSigner;
}): Promise<APSPreflightResult> {
  if (!input.preflight.approved) {
    return input.preflight;
  }

  const processorResult = await input.processor(input.payment, input.preflight);
  const receipt = signActionReceipt(
    createReceiptBody({
      ...input.preflight.receipt,
      processorPaymentId: processorResult.id,
    }),
    input.receiptSigner,
  );

  return {
    ...input.preflight,
    receipt,
  };
}

export { DelegationSpendLedger } from "./budget";
