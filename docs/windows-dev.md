# Windows Dev Notes

## Standard loop
- Use `pnpm` only.
- Start with `pnpm dev` (repo default is webpack dev).
- Open `http://localhost:3000`.
- Stop/restart dev server if Fast Refresh stalls.

## Common fixes
- `os error 1314`: enable Windows Developer Mode, then restart dev server.
- Turbopack panic/loop: run `pnpm exec next dev --webpack`.
- File I/O benchmark warning (`os error 3`): use webpack dev.
- Port `3000` busy: use printed fallback port or free the process.

## Verify before handoff
- Run `pnpm -s lint && pnpm -s typecheck && pnpm -s build`.
- Include `git status -sb` and `git diff --stat` in handoff notes.
- Keep lockfiles unchanged unless explicitly requested.
