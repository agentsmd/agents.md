export interface SpendAttempt {
  id: string;
  delegationId: string;
  amountMinor: number;
  currency: string;
  merchantId: string;
  decision: "ALLOW" | "BLOCK";
  timestamp: string;
  reason?: string;
}

export type BudgetFailure = "budget_exceeded" | "budget_currency_mismatch";

export interface BudgetCheckResult {
  ok: boolean;
  remainingMinor: number;
  reason?: BudgetFailure;
}

export class DelegationSpendLedger {
  private readonly approvedSpendByDelegation = new Map<string, number>();
  private readonly attemptLog: SpendAttempt[] = [];

  getApprovedSpendMinor(delegationId: string): number {
    return this.approvedSpendByDelegation.get(delegationId) ?? 0;
  }

  getAttempts(): readonly SpendAttempt[] {
    return [...this.attemptLog];
  }

  checkRemaining(input: {
    delegationId: string;
    requestedAmountMinor: number;
    maxSpendMinor: number;
    currency: string;
    expectedCurrency: string;
  }): BudgetCheckResult {
    if (input.currency !== input.expectedCurrency) {
      return { ok: false, remainingMinor: 0, reason: "budget_currency_mismatch" };
    }

    const remainingMinor = input.maxSpendMinor - this.getApprovedSpendMinor(input.delegationId);
    if (input.requestedAmountMinor > remainingMinor) {
      return { ok: false, remainingMinor, reason: "budget_exceeded" };
    }

    return { ok: true, remainingMinor };
  }

  recordAttempt(attempt: SpendAttempt): void {
    this.attemptLog.push({ ...attempt });
  }

  recordApprovedSpend(delegationId: string, amountMinor: number): void {
    this.approvedSpendByDelegation.set(
      delegationId,
      this.getApprovedSpendMinor(delegationId) + amountMinor,
    );
  }
}
