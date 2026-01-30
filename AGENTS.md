# AGENTS.md — Working Agreement (Next.js + pnpm + Windows)

This repo is a **Next.js** app in the **repo root** (Pages Router via `pages/`).
Goal: keep the dev loop fast, avoid lockfile churn, and prevent Windows/Turbopack pain.

## 0) Golden rules

- Use **pnpm** only (avoid `package-lock.json` churn).
- Prefer `pnpm dev` for iteration. Avoid `pnpm build` during agent sessions.
- On Windows, if Turbopack panics/loops, use **webpack dev** (`--webpack`).

## 1) Setup (Windows)

From repo root:

- Enable Corepack (one-time): `corepack enable`
- Pin pnpm (repo expects): `corepack prepare pnpm@9.15.1 --activate`
- Install deps: `pnpm install`

If the repo folder is renamed/moved:

- `rm -rf node_modules`
- `pnpm install`

## 2) Dev loop

Start:

- `pnpm dev`

Open:

- <http://localhost:3000>

If Fast Refresh feels stuck:

- Stop server (Ctrl+C)
- Restart: `pnpm dev`

## 3) Windows gotchas

### A) Symlink privilege (os error 1314)

If you see “required privilege not held” / `os error 1314`:

- Enable **Windows Developer Mode**
  - Settings → System → For developers → Developer Mode = ON
- Restart `pnpm dev`

### B) Turbopack panic loops

If you see repeated:

- `FATAL: An unexpected Turbopack error occurred`
- `next-panic-*.log` written

Use webpack dev:

- One-off: `pnpm exec next dev --webpack`
- Recommended: set `package.json` dev script to `next dev --webpack`

### C) File I/O benchmark warning (os error 3)

If you see: “Failed to benchmark file I/O (os error 3)”
and it correlates with Turbopack instability:

- use webpack dev (`--webpack`)

## 4) Lint

Run:

- `pnpm exec next lint`

(If you see “Invalid project directory …\lint”, double-check you are in repo root.)

## 5) Dependency & lockfile rules

- If deps change, `pnpm-lock.yaml` must change.
- Do not delete `pnpm-lock.yaml` unless explicitly instructed.
- After dep changes, restart dev server.

## 6) Where things live

- Pages/routes: `pages/`
- Components: `components/`
- Styles: `styles/`
- Static assets: `public/`
- Next config: `next.config.ts`
- TS config: `tsconfig.json`
- This doc: `AGENTS.md`

## 7) Agent workflow expectations

- Keep diffs small and scoped.
- Ask before installing/updating deps.
- After changes: show `git status -sb` and a 3-bullet diff summary.
