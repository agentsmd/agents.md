# AGENTS.md — Working Agreement (Next.js + pnpm + Windows)

This repo is a **Next.js** app at the **repo root** using the **Pages Router** (`pages/`).  
Primary goal: keep the dev loop **fast + boring**, avoid lockfile churn, and prevent common Windows/Turbopack failure modes.

> **Audience:** Humans + agents working on this repo.  
> **Tone:** “Do the simplest thing that keeps CI and local dev deterministic.”

---

## Table of Contents

- [Golden Rules](#golden-rules)
- [Quickstart (Windows)](#quickstart-windows)
- [Daily Dev Loop](#daily-dev-loop)
- [Windows Gotchas](#windows-gotchas)
  - [Symlink privilege (os error 1314)](#symlink-privilege-os-error-1314)
  - [Turbopack panic loops / next-panic logs](#turbopack-panic-loops--next-panic-logs)
  - [File I/O benchmark warning (os error 3)](#file-io-benchmark-warning-os-error-3)
  - [Port already in use (3000)](#port-already-in-use-3000)
- [Linting](#linting)
- [Dependencies & lockfile rules](#dependencies--lockfile-rules)
- [Project map](#project-map)
- [Task-specific docs pointers](#task-specific-docs-pointers)
- [Verification](#verification)
- [Dont do this guardrails](#dont-do-this-guardrails)
- [Agent workflow expectations](#agent-workflow-expectations)
- [Troubleshooting checklist](#troubleshooting-checklist)

---

## Golden Rules

- **Use `pnpm` only.**  
  Do not introduce `package-lock.json` or `yarn.lock`. If one appears, remove it and explain why.

- **Prefer `pnpm dev` for iteration.**  
  Avoid `pnpm build` during active agent sessions unless explicitly requested.

- **Windows stability > Turbopack speed.**  
  If Turbopack panics/loops, switch to **webpack dev** (`--webpack`) immediately.

- **Keep diffs small and scoped.**  
  One PR/change-set should ideally address one concern.

- **Ask before changing dependencies.**  
  Dependency upgrades are easy to do badly and hard to unwind.

---

## Quickstart (Windows)

From repo root:

### Enable Corepack (one-time)

```bash
corepack enable
```

### Pin pnpm (repo expects)

```bash
corepack prepare pnpm@9.15.1 --activate
pnpm -v
```

### Install dependencies

```bash
pnpm install
```

### If the repo folder was moved/renamed (common Windows footgun)

Sometimes moving a repo breaks native bindings / paths:

```bash
rm -rf node_modules
pnpm install
```

---

## Daily Dev Loop

### Start the dev server

```bash
pnpm dev
```

### Open the app

- <http://localhost:3000>

### If Fast Refresh feels stuck

- Stop server (**Ctrl+C**)
- Restart:

```bash
pnpm dev
```

### If you need webpack dev (Windows fallback)

One-off:

```bash
pnpm exec next dev --webpack
```

If webpack dev becomes your default on Windows, update `package.json`:

- `"dev": "next dev --webpack"`

(Do this only if Turbopack keeps failing; don’t churn scripts for no reason.)

---

## Windows Gotchas

### Symlink privilege (os error 1314)

Symptoms:

- “required privilege not held”
- `os error 1314`

Fix:

- Enable **Windows Developer Mode**:
  - Settings → System → For developers → **Developer Mode = ON**
- Restart the dev server:

```bash
pnpm dev
```

---

### Turbopack panic loops / next-panic logs

Symptoms:

- `FATAL: An unexpected Turbopack error occurred`
- `next-panic-*.log` written
- repeated crashes / infinite rebuild loop

Fix:

- Switch to webpack dev:

```bash
pnpm exec next dev --webpack
```

Optional (recommended if recurring):

- Set `"dev": "next dev --webpack"` in `package.json` so Windows runs stay stable.

---

### File I/O benchmark warning (os error 3)

Symptoms:

- “Failed to benchmark file I/O (os error 3)”
- Often correlates with Turbopack instability on Windows

Fix:

- Use webpack dev:

```bash
pnpm exec next dev --webpack
```

---

### Port already in use (3000)

Symptoms:

- Next.js says port 3000 is already in use
- or it silently jumps to 3001 and you’re confused

Fix:

- If Next auto-switches ports, use the printed URL in terminal.
- Or kill the process that holds 3000 (advanced; do only if needed).

---

## Linting

Run from repo root:

```bash
pnpm exec next lint
```

If you see:

- “Invalid project directory …\lint”

You are almost certainly not in the repo root. Confirm with:

```bash
pwd
ls -la
```

---

## Dependencies & lockfile rules

- If dependencies change, **`pnpm-lock.yaml` must change**.
- Do **not** delete `pnpm-lock.yaml` unless explicitly instructed.
- After dependency changes:
  - rerun `pnpm install`
  - restart dev server (`pnpm dev`)

Agent rule:

- **Ask first** before:
  - adding deps
  - upgrading Next/React
  - changing build tooling

---

## Project map

- Pages/routes: `pages/`
- Components: `components/`
- Styles: `styles/`
- Static assets: `public/`
- Next config: `next.config.ts`
- TypeScript env: `next-env.d.ts`
- TS config: `tsconfig.json`
- This doc: `AGENTS.md`

---

## Task-specific docs pointers

- For UI/component changes, start with `docs/ui.md`.
- For accessibility pass/fail checks, use `docs/a11y.md`.
- For Windows-local development issues, use `docs/windows-dev.md`.
- Use progressive discovery: open only the task-relevant doc first, then expand scope only if blocked.

---

## Verification

Run this from repo root before handoff:

```bash
pnpm -s lint && pnpm -s typecheck && pnpm -s build
```

---

## Dont do this guardrails

- **pnpm only** for installs and scripts.
- **Never create or modify lockfiles** (`pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`) unless explicitly requested.
- **Ask before changing dependencies or tooling** (including Next.js, React, lint/build tooling).

---

## Agent workflow expectations

When making changes:

1. **Show state truth first**
   - `git status -sb`

1. **Keep the diff minimal**
   - avoid formatting-only churn
   - avoid drive-by refactors

1. **After changes, provide**
   - `git status -sb`
   - `git diff --stat`
   - 3 bullets:
     - what changed
     - why it changed
     - how to verify quickly

1. **Don’t change dependencies without permission**
   - if a dep change is required, propose it first with justification

---

## Troubleshooting checklist

If “things are weird,” do this in order:

1. Confirm repo root:

   ```bash
   pwd
   ls -la
   ```

1. Confirm pnpm version:

   ```bash
   pnpm -v
   ```

1. Clean install if needed:

   ```bash
   rm -rf node_modules
   pnpm install
   ```

1. Run dev:

   ```bash
   pnpm dev
   ```

1. If Windows/Turbopack melts:

   ```bash
   pnpm exec next dev --webpack
   ```
