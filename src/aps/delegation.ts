import { sha256Hash, verifyPayload } from "./crypto";

export type CommerceAction = "commerce.payment" | "commerce.refund" | "commerce.quote";

export interface DelegationScope {
  actions: CommerceAction[];
  maxSpendMinor: number;
  currency: string;
  merchantCategories?: string[];
}

export interface DelegationClaims {
  id: string;
  humanPrincipalId: string;
  agentPassportId: string;
  issuedAt: string;
  expiresAt: string;
  scope: DelegationScope;
  parentDelegationId?: string;
}

export interface Delegation extends DelegationClaims {
  signature?: string;
}

export interface DelegationRegistry {
  principalPublicKeys: Record<string, string>;
}

export type ScopeFailure =
  | "delegation_missing"
  | "delegation_unsigned"
  | "delegation_unknown_principal"
  | "delegation_bad_signature"
  | "delegation_not_human_originated"
  | "delegation_expired"
  | "delegation_wrong_agent"
  | "delegation_action_not_allowed"
  | "delegation_currency_mismatch"
  | "delegation_amount_exceeds_scope";

export interface ScopeAuthorizationResult {
  ok: boolean;
  reason?: ScopeFailure;
  chainHash?: string;
}

export function delegationClaims(delegation: Delegation): DelegationClaims {
  return {
    id: delegation.id,
    humanPrincipalId: delegation.humanPrincipalId,
    agentPassportId: delegation.agentPassportId,
    issuedAt: delegation.issuedAt,
    expiresAt: delegation.expiresAt,
    scope: delegation.scope,
    parentDelegationId: delegation.parentDelegationId,
  };
}

export function delegationChainHash(delegationChain: Delegation[]): string {
  return sha256Hash(delegationChain.map(delegationClaims));
}

export function authorizeDelegationScope(input: {
  delegationChain: Delegation[];
  registry: DelegationRegistry;
  agentPassportId: string;
  action: CommerceAction;
  amountMinor: number;
  currency: string;
  now: Date;
}): ScopeAuthorizationResult {
  const [rootDelegation] = input.delegationChain;
  const leafDelegation = input.delegationChain.at(-1);

  if (!rootDelegation || !leafDelegation) {
    return { ok: false, reason: "delegation_missing" };
  }

  if (rootDelegation.parentDelegationId) {
    return { ok: false, reason: "delegation_not_human_originated" };
  }

  for (const delegation of input.delegationChain) {
    if (!delegation.signature) {
      return { ok: false, reason: "delegation_unsigned" };
    }

    const principalKey = input.registry.principalPublicKeys[delegation.humanPrincipalId];
    if (!principalKey) {
      return { ok: false, reason: "delegation_unknown_principal" };
    }

    if (!verifyPayload(delegationClaims(delegation), delegation.signature, principalKey)) {
      return { ok: false, reason: "delegation_bad_signature" };
    }

    if (Number.isNaN(Date.parse(delegation.expiresAt)) || new Date(delegation.expiresAt) <= input.now) {
      return { ok: false, reason: "delegation_expired" };
    }

    if (delegation.agentPassportId !== input.agentPassportId) {
      return { ok: false, reason: "delegation_wrong_agent" };
    }
  }

  if (!leafDelegation.scope.actions.includes(input.action)) {
    return { ok: false, reason: "delegation_action_not_allowed" };
  }

  if (leafDelegation.scope.currency !== input.currency) {
    return { ok: false, reason: "delegation_currency_mismatch" };
  }

  if (input.amountMinor > leafDelegation.scope.maxSpendMinor) {
    return { ok: false, reason: "delegation_amount_exceeds_scope" };
  }

  return { ok: true, chainHash: delegationChainHash(input.delegationChain) };
}
