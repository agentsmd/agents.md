# SkyGrid Web3 On-Ramp Reference Generator

The SkyGrid Web3 on-ramp flow is a non-custodial payment reference generator for Base Mainnet USDC. It prepares IDs and validation metadata that an operator can reconcile after a user manually approves a wallet transaction.

## Contract

- Default chain: Base Mainnet (`8453`).
- Default token: Base USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`).
- Receiver wallet: `0xbAA5A03bC268546194550a427d3F1d5787c15403`.
- Payment references use `SG-{YYYYMMDD}-{SHORT_RANDOM}`.
- Proof submissions require an on-ramp ID, payment reference, proof ID, Base transaction hash, receiver wallet, token address, amount, and explicit consent.

## Safety boundary

This implementation does not accept private keys, seed phrases, mnemonics, custody, server-side signing material, or automatic transfer instructions. Wallet approval is manual and user-controlled.

## API routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/web3/chains/health` | `GET` | Returns supported Base chain, Base USDC token, treasury wallet, and non-custodial guardrails. |
| `/api/web3/onramp/new` | `POST` | Creates `onRampId`, `paymentRef`, and `proofId` for a consented on-ramp quote. |
| `/api/web3/onramp/proof` | `POST` | Validates submitted transaction proof metadata for operator review. |

## Airtable adapter hooks

The API response includes an `airtable.adapterPrepared` marker and required environment names. The production adapter should only persist reference/proof metadata after operator configuration is present:

- `AIRTABLE_BASE_ID`
- `AIRTABLE_ONRAMP_TABLE_ID`
- `AIRTABLE_API_KEY`

Do not expose Airtable credentials to client-side code.
