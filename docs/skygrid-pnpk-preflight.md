# SKYGRID PNPK auto-drill preflight

The PNPK preflight is a passive, fail-closed check of the controlled-pilot bridge. It
requests the six MVP-72 routes, compares the status manifest to observed responses,
checks the six AWS readiness flags, and verifies that the four production guardrails
remain `false`. It never changes routing, activates devices, moves private data, or
executes payments.

Run it against a deployment with:

```sh
pnpm skygrid:preflight -- https://deployment.example
```

The JSON report assigns findings to the MVP-72 response lanes and supplies applicable
Linear labels. HTTP 401/403 responses are classified as **P2 CI/Auth Blocker**, allowing
a Vercel protection bypass or trusted-source configuration to be reviewed without
misreporting the bridge itself as healthy.

## Automation setup

The scheduled workflow runs every six hours. Configure the repository variable
`SKYGRID_PREFLIGHT_BASE_URL` and the secrets `LINEAR_API_KEY` and `LINEAR_TEAM_ID`.
When the report is not ready, the workflow uploads it, creates a labeled Linear issue,
and fails visibly. Label lookup is name-based; create the requested MVP-72 labels in
the target Linear team so all applicable labels can be attached.

## Readiness findings from repository validation

- All six documented paths now have local runtime contracts, including a passive
  `/api/aura-core/decide` response, so the prior advertised-route 404 is resolved in
  code pending deployment proof.
- The status contract advertises exactly the routes exercised by the preflight.
- AWS readiness remains fail-closed: every flag is derived from server-side environment
  presence and remains false until its deployment value is configured. No credentials
  or environment values are returned.
- The CI-safe access path is configurable but not proven by this repository change;
  protected deployments still require Vercel trusted-source or bypass configuration.
- Revenue, network economics, and speculative valuation are outside this operational
  report; no revenue or P&L claim is made.
