import { randomUUID } from "node:crypto";
import { signPayload, verifyPayload, type PrivateSigningKey } from "./crypto";

export type GateName = "passport" | "scope" | "budget" | "merchant";
export type PaymentDecision = "ALLOW" | "BLOCK";

export interface GateResult {
  gate: GateName;
  passed: boolean;
  reason?: string;
}

export interface ReceiptAmount {
  amountMinor: number;
  currency: string;
}

export interface ActionReceiptBody {
  id: string;
  timestamp: string;
  agentPassportId: string;
  agentPublicKeyFingerprint?: string;
  humanPrincipalId?: string;
  delegationId?: string;
  delegationChainHash?: string;
  merchantId: string;
  amount: ReceiptAmount;
  gateResults: GateResult[];
  decision: PaymentDecision;
  processorPaymentId?: string;
}

export interface ActionReceipt extends ActionReceiptBody {
  signature: string;
}

export interface ReceiptSigner {
  keyId: string;
  privateKey: PrivateSigningKey;
}

export class AppendOnlyReceiptLog {
  private readonly receipts: ActionReceipt[] = [];

  append(receipt: ActionReceipt): void {
    if (this.receipts.some((existing) => existing.id === receipt.id)) {
      throw new Error(`Receipt ${receipt.id} already exists`);
    }

    this.receipts.push(Object.freeze({ ...receipt, gateResults: [...receipt.gateResults] }));
  }

  all(): readonly ActionReceipt[] {
    return [...this.receipts];
  }
}

export function receiptBody(receipt: ActionReceipt): ActionReceiptBody {
  return {
    id: receipt.id,
    timestamp: receipt.timestamp,
    agentPassportId: receipt.agentPassportId,
    agentPublicKeyFingerprint: receipt.agentPublicKeyFingerprint,
    humanPrincipalId: receipt.humanPrincipalId,
    delegationId: receipt.delegationId,
    delegationChainHash: receipt.delegationChainHash,
    merchantId: receipt.merchantId,
    amount: receipt.amount,
    gateResults: receipt.gateResults,
    decision: receipt.decision,
    processorPaymentId: receipt.processorPaymentId,
  };
}

export function signActionReceipt(body: ActionReceiptBody, signer: ReceiptSigner): ActionReceipt {
  return {
    ...body,
    signature: signPayload({ ...body, receiptSignerKeyId: signer.keyId }, signer.privateKey),
  };
}

export function verifyActionReceipt(receipt: ActionReceipt, publicKey: string, keyId: string): boolean {
  return verifyPayload(
    { ...receiptBody(receipt), receiptSignerKeyId: keyId },
    receipt.signature,
    publicKey,
  );
}

export function createReceiptBody(input: Omit<ActionReceiptBody, "id" | "timestamp"> & {
  id?: string;
  timestamp?: string;
}): ActionReceiptBody {
  return {
    id: input.id ?? `ar_${randomUUID()}`,
    timestamp: input.timestamp ?? new Date().toISOString(),
    agentPassportId: input.agentPassportId,
    agentPublicKeyFingerprint: input.agentPublicKeyFingerprint,
    humanPrincipalId: input.humanPrincipalId,
    delegationId: input.delegationId,
    delegationChainHash: input.delegationChainHash,
    merchantId: input.merchantId,
    amount: input.amount,
    gateResults: input.gateResults,
    decision: input.decision,
    processorPaymentId: input.processorPaymentId,
  };
}
