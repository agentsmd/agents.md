# Contributing to AGENTS.md

Thanks for helping. This repository holds two things: the **AGENTS.md format**, which is
deliberately minimal and rarely changes, and the **agents.md website** that documents it,
a Next.js app. Most contributions are to the website.

AGENTS.md is a [Agentic AI Foundation](https://aaif.io) project. See
[GOVERNANCE.md](GOVERNANCE.md) for who decides what, and [OWNERS.md](OWNERS.md) for who
currently reviews.

## Read this first: what gets merged

The queue is long, so the fastest way to get a change landed is to make it obviously
mergeable. In descending order of how quickly they move:

| Change | Speed |
|---|---|
| Adding a tool to the compatibility list, with proof it reads AGENTS.md | Fast, if it follows the rules below |
| Fixing a broken link, typo or factual error on the site | Fast |
| Clarifying the FAQ or examples | Medium, needs a reviewer to agree the confusion is real |
| Website design, dependency or refactor changes | Slow, please open an issue first |
| Changing the format itself | See [Changes to the format](#changes-to-the-format). Usually the answer is no |

**One change per pull request.** A PR that adds a tool *and* restyles a section *and*
bumps a dependency cannot be reviewed in one pass, so it will sit. Split it.

## Adding a tool to the compatibility list

This is the most common contribution. The list lives in
[`components/CompatibilitySection.tsx`](components/CompatibilitySection.tsx).

Requirements, all of them:

1. **The tool must actually read `AGENTS.md`.** Not "plans to", not "reads a file you can
   symlink to it". It discovers and uses `AGENTS.md` today, in a released version.
2. **Link to public evidence in the PR description**: documentation, a changelog entry, or
   source code showing the file being read. A marketing page that merely mentions
   AGENTS.md is not evidence.
3. **One tool per pull request**, so a disputed entry never blocks an uncontested one.
4. **Keep the existing order and formatting** in the component. Do not reflow neighbouring
   entries.
5. **Say whether nested `AGENTS.md` files are supported**, if you know. Users ask.

Reviewers will close entries that cannot be verified from the linked evidence. That is not
a judgement about the tool, only about what can be checked.

If your tool reads a differently-named file and you want that recorded, that is a website
documentation question rather than a compatibility entry. Open an issue.

## Changes to the format

**The default answer is no, and that is the point.** AGENTS.md has no required fields, no
schema and no version. That is what makes it cheap for every agent to support and safe for
every repository to adopt. Most proposals to add structure would break one or both.

Before proposing a format change, please check:

- Can it be a convention that some projects adopt voluntarily, without the format
  requiring it? If yes, write it up as documentation instead.
- Does it require every consuming tool to change? If yes, it needs the Technical
  Committee, not a pull request. Open an issue in
  [aaif/project-proposals](https://github.com/aaif/project-proposals).
- Does it make an existing valid `AGENTS.md` invalid? Then it will be declined.

## Website development

Node with [pnpm](https://pnpm.io) 9.15.1, as pinned in `package.json`.

```bash
pnpm install
pnpm dev      # Next.js dev server with hot reload
pnpm lint     # ESLint, run before pushing
```

Do not commit `pnpm run build` output. Note that this repository's own
[`AGENTS.md`](AGENTS.md) asks agents **not** to run `pnpm build` during an interactive
session, because switching `.next/` to production assets breaks hot reload for the rest of
the session.

Prefer TypeScript for new components, and co-locate component-specific styles with the
component.

## Pull requests

- Branch from `main`, keep the branch focused, and rebase rather than merge if `main`
  moves under you.
- Write a description that states what changed and how a reviewer can verify it. For
  compatibility entries, that means the evidence link.
- Sign your commits off with `git commit -s`, adding a `Signed-off-by` line per the
  [Developer Certificate of Origin](https://developercertificate.org/). This is the
  standard practice for Linux Foundation projects. Maintainers: if the project has settled
  on different inbound terms, correct this section and enable the matching check.
- Expect review latency. If a PR has had no response in two weeks, comment on it once to
  bump it rather than opening a duplicate.

## Issues

Use an issue, not a pull request, when:

- You want to propose a change to the format.
- You want to redesign part of the site.
- You are unsure whether a tool qualifies for the compatibility list.
- Something on the site is wrong but you are not sure what the right answer is.

Issues that are advertisements, unrelated to AGENTS.md, or contain no actionable request
will be closed. This is not personal; an unfiltered queue is why review is slow for
everyone else.

## Code of Conduct

This project follows the
[Linux Foundation Code of Conduct](https://lfprojects.org/policies/code-of-conduct/).
Report concerns to the maintainers listed in [OWNERS.md](OWNERS.md), or, if that is not
appropriate, to the Foundation at `support@aaif.io`.
