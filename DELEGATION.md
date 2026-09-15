# Sample DELEGATION.md file

## Principal
- Support operations team
- Human approval required for financial, legal, or physical actions

## Allowed actions
- Read order history
- Draft refund recommendations
- Issue refunds up to $50

## Forbidden actions
- Send customer emails without fresh approval
- Change account ownership
- Export bulk customer data

## Allowed delegatees
- triage-agent
- policy-agent
- refund-tool

## Delegation limits
- Max depth: 2
- Expiry: session-bound
- Scope expansions require reauthorization

## Reauthorization triggers
- Read -> write
- Draft -> send
- New tool or dataset
- Higher-privilege credential

## Audit
- Attach an authorization receipt to every delegated action
- Preserve append-only hop history
