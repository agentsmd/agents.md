<!--
Thanks for contributing. Delete the sections that do not apply.
One change per pull request, please: see CONTRIBUTING.md.
-->

## What this changes

<!-- One or two sentences. -->

## Type

- [ ] Adding a tool to the compatibility list
- [ ] Fixing a typo, broken link or factual error
- [ ] Clarifying documentation, FAQ or examples
- [ ] Website code, design or dependencies
- [ ] Change to the AGENTS.md format itself

## If adding a tool to the compatibility list

Reviewers need to verify this without installing anything, so all three are required:

- **Tool name and link:**
- **Evidence it reads `AGENTS.md` today** (docs, changelog or source permalink, not a
  marketing page):
- **Released version where this works:**
- Does it support nested `AGENTS.md` files? <!-- yes / no / unknown -->

## If changing the format itself

Format changes are decided by the AAIF Technical Committee, not in this repository. Please
open an issue in
[aaif/project-proposals](https://github.com/aaif/project-proposals) first and link it here.

- **Proposal link:**
- Does this make any currently valid `AGENTS.md` invalid? <!-- yes / no -->

## Checklist

- [ ] One logical change only
- [ ] `pnpm lint` passes
- [ ] Commits are signed off (`git commit -s`)
- [ ] I did not run `pnpm build` and commit its output
