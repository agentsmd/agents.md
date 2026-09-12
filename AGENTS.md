# AGENTS Guidelines for This Repository

This repository contains the SKYGRID / Aura-Core public front door built with Next.js.
It is a public-facing website and proof surface, not a wallet executor, exchange bot,
or hidden compute client.

Agents working in this repo must preserve three priorities:

1. keep the website deployable,
2. keep dependency and lockfile proof clean,
3. keep public claims aligned with verified evidence.

## 1. Use the Development Server During Agent Sessions

- Use `pnpm dev` while iterating on UI and content.
- Do **not** run `pnpm build` inside an interactive agent session unless explicitly asked.
- Production builds are allowed in CI, Vercel, or a dedicated verification pass.
- If HMR behaves oddly, restart the dev server instead of forcing a build.

## 2. Keep Dependencies and Lockfile in Sync

This repo uses pnpm.

When dependencies change:

1. update `package.json`,
2. run `pnpm install`,
3. commit the refreshed `pnpm-lock.yaml`,
4. run `pnpm lint`,
5. verify the deployment workflow or Vercel build.

Do not leave `package.json` and `pnpm-lock.yaml` out of sync.

Current security intent:

- keep Next.js and React on patched versions for React Server Components advisories,
- avoid broad major-version jumps unless needed,
- prefer a minimal security patch plus clean lockfile refresh.

## 3. Heavy-Traffic Website Rules

The website should remain edge-first and cache-forward.

Preserve:

- immutable cache headers for Next.js static assets,
- immutable cache headers for public assets and logos,
- short cache for `/health.json`,
- stale-while-revalidate for normal public pages,
- basic browser security headers.

Do not add dynamic proof workloads directly to the marketing front door unless they have
explicit cache and rate-limit behavior.

## 4. SKYGRID / AWS Environment Wiring

The site may expose public, non-secret environment values only.

Expected Vercel aliases:

```text
aws_region
skygrid_api_base
skygrid_health_url
```

Expected public env mappings:

```text
NEXT_PUBLIC_SKYGRID_MODE
NEXT_PUBLIC_SKYGRID_NETWORK

NEXT_PUBLIC_SKYGRID_API_BASE
NEXT_PUBLIC_SKYGRID_HEALTH_URL
```

Never commit AWS keys, Vercel tokens, wallet secrets, API keys, or `.env` files.

## 5. Proof-First Public Language

Use proof-forward language.

Safe wording:

> SKYGRID Option B is a local-first, cloud-reserve validation architecture with an
> edge-cached website front door and public health manifest.

Avoid unsupported claims such as:

- guaranteed uptime without test results,
- fully live national deployment,
- automatic exchange execution,
- wallet movement,
- swaps,
- staking,
- hidden mining,
- production AWS execution before workflow proof exists.

## 6. Safety Boundary

This repo may describe validation, routing, architecture, proof artifacts, pilot access,
and website readiness.

This repo must not implement or advertise:

- wallet movement,
- token swaps,
- bridge transfers,
- hidden mining,
- exchange trades,
- surveillance features,
- secret collection.

## 7. Agent Execution Training

Agents should act like careful release engineers, not autonomous operators.

Default behavior:

- inspect the current file before editing it,
- keep changes small and reviewable,
- prefer one concern per commit,
- explain verification evidence in commit messages or PR notes,
- leave rollback paths intact,
- preserve existing naming unless the task explicitly asks for a rename.

Do not:

- invent live network status,
- claim a deployment succeeded without CI, Vercel, or health endpoint proof,
- convert advisory routing copy into claims of automatic carrier-grade failover,
- move secrets into client-side code,
- replace verified public language with hype.

## 8. SkyGrid Routing and Failover Language

SkyGrid public copy should describe routing as advisory, testable, and evidence-backed.

Allowed concepts:

- failover recommendation,
- endpoint health checks,
- region comparison,
- public health manifest,
- dispatcher demo mode,
- local-first validation,
- cloud-reserve fallback,
- edge-cached public front door.

Require explicit proof before claiming:

- automated OS-level network switching,
- carrier production integration,
- live emergency dispatch authority,
- national or global production coverage,
- guaranteed bandwidth savings,
- guaranteed income or yield.

## 9. Issue-to-Commit Discipline

When a task mentions Linear, GitHub Issues, Postman, Vercel, AWS, or B12:

1. identify the specific blocker,
2. make the smallest code or documentation change that reduces that blocker,
3. add or update a test when the behavior is executable,
4. keep public wording aligned with verified evidence,
5. commit with a conventional message.

Preferred commit prefixes:

- `docs:` for public copy, architecture notes, and agent guidance,
- `fix:` for broken behavior,
- `test:` for verification coverage,
- `chore:` for dependency, CI, and repo maintenance,
- `feat:` only when user-visible capability is added.

## 10. CI and Verification Gates

The repository CI currently installs dependencies with pnpm and runs `pnpm run lint`.
Agents should keep this path green.

Before claiming completion, verify as much of the following as the environment allows:

1. `pnpm install --frozen-lockfile`,
2. `pnpm run lint`,
3. `pnpm test` when executable behavior changes,
4. Vercel build or deployment status when deployment behavior changes,
5. `/health.json` after deploy when public health status is touched.

If verification cannot be run, state exactly what was not verified and why.

## 11. Content Architecture Rules

The site should remain understandable to a first-time visitor in under one minute.

Public pages should answer:

- what SkyGrid is,
- what problem it solves,
- what is live versus planned,
- what proof exists,
- how a pilot partner can engage.

Avoid burying key proof, contact paths, or health indicators behind vague slogans.

## 12. Useful Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server with HMR. |
| `pnpm install` | Refresh dependencies and `pnpm-lock.yaml`. |
| `pnpm lint` | Run the TypeScript check configured for this repo. |
| `pnpm test` | Run the repository test suite. |
| `pnpm build` | Production build; use in CI/Vercel or explicit verification only. |
| `pnpm endpoint:matrix` | Generate the endpoint matrix artifact when endpoint configuration changes. |

## 13. Recommended Next Verification

After dependency/security changes, verify:

1. `pnpm install --frozen-lockfile` passes,
2. `pnpm lint` passes,
3. Vercel build passes,
4. `/health.json` is reachable after deploy,
5. cache headers are present on static assets and public pages.

When in doubt, preserve deployability and create a small reviewable change instead of a
large mixed-purpose commit.
