# SkyGrid AI Resource Training Loop

Source-of-truth for Linear issue `MVP-64`.

Baseline commit under review: `6a910c047e9d8aa9980c3a7f551de3647604c4d1`.
Current routing mode: `base_primary_protected_ready`.
Guard configuration: `skygrid-sunpay-base-rate-guard`.
Pricing decision: `HOLD`.

This loop coordinates connected AI and workflow resources for SkyGrid / Aura-Core
production-failover training. It is advisory and fail-closed: the public runtime may
publish route health, proof-lane state, and operator readiness gates, but it must not
perform live cutover, payment execution, private data movement, or device activation
without explicit operator approval.

## Connected resources

| Resource | Training role | Fail-closed boundary |
| --- | --- | --- |
| GitHub | Runtime code, config, commits, and CI status. | No secret material or unverified deploy-success claims. |
| Linear | Execution tracker, blockers, readiness gates, and operator approval record. | Approval must be explicit before any cutover or activation step. |
| Airtable | Operator dashboard and route-status view. | Dashboard state is advisory unless backed by proof artifacts. |
| Postman/Newman | Required-route validation and proof packet generation. | Failed or missing checks keep protected mode active. |
| Vercel | Public advisory runtime and primary edge lane. | Health must be proven before it is marked healthy. |
| AWS | Fallback health mirror. | Mirror failures are advisory signals, not automatic cutover commands. |
| Web3/Base | Quote/status advisory lane. | No swaps, transfers, signing, staking, or payment execution. |

## Required route contract

The training loop tracks these routes as the minimum proof surface:

| Route | Expected behavior |
| --- | --- |
| `/` | Public runtime manifest with resource, route, gate, and guardrail metadata. |
| `/health.json` | Short-cache public health status for the advisory runtime. |
| `/highway` | Advisory failover-expressway status. |
| `/api/highway/status` | Machine-readable protected-standby highway status. |
| `/api/highway/flasks` | Dry-run external-workflow lane status. |
| `/api/highway/postman` | Postman/Newman proof-lane manifest. |
| `/dispatch` | Advisory dispatch lane with protected-mode hold. |
| `/scenarios` | Training scenario list for base, rates, and highway drills. |
| `/rates` | Advisory Base-rate lane with `pricingDecision: HOLD`. |
| `/base` | Base status advisory lane; no Web3 execution. |
| `/pay` | Operator-approved-only quote surface; no live charge. |
| `/api/pay/quote?amount=25` | Quote-only payload that preserves the hold decision. |
| `/api/stripe/device-link` | Device-link placeholder with activation disabled. |

## Readiness gates

| Gate | Required proof before clearing |
| --- | --- |
| Primary Vercel lane healthy | Vercel deployment or runtime health evidence. |
| Postman/Newman route checks pass | Newman run covering every required route. |
| AWS mirror health pass | AWS health mirror response captured in the proof packet. |
| Advisory language confirmed | Public copy and route payloads avoid execution or cutover claims. |
| Operator approval recorded | Linear or approved operator system records approval. |
| Sentinel review pass | Safety review confirms fail-closed behavior and no private data movement. |
| Rollback route documented | Rollback instructions remain available before protected mode is lifted. |

Protected mode remains active whenever a required proof is missing or failed. In protected
mode, the runtime returns advisory status only, holds pricing execution, requires operator
approval, and keeps payment/device activation disabled.

## Operator runbook

1. Confirm the source commit and this document are in sync with the Linear issue.
2. Run the required-route Postman/Newman proof lane against the target Vercel URL.
3. Capture AWS mirror health evidence and attach it to the proof packet.
4. Review public copy and route payloads for advisory-only language.
5. Record operator approval and Sentinel review before changing any protected-mode status.
6. If any gate fails, keep `pricingDecision: HOLD`, retain protected mode, and document the
   blocker in Linear.

## Rollback path

Rollback is the safe default. Revert the route/config commit or redeploy the last known-good
Vercel deployment, keep `/health.json` short-cached, and leave connected-resource dashboards
in advisory/protected mode until the required proof packet is regenerated and approved.
