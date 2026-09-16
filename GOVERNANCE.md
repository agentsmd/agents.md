# Governance

AGENTS.md is a project of the [Agentic AI Foundation](https://aaif.io) (AAIF), a directed
fund of The Linux Foundation. It was contributed to the Foundation in December 2025 and is
listed as a Technical Project by the
[AAIF Technical Committee](https://github.com/aaif/technical-committee).

This document describes how decisions are made in this repository. Where it conflicts with
the [AAIF Technical Charter](https://github.com/aaif/technical-committee/blob/main/governance/charter.md)
or the [Project Lifecycle Policy](https://github.com/aaif/technical-committee/blob/main/governance/project-lifecycle-policy.md),
those documents control.

## Scope of this repository

Two things with very different change rates:

1. **The AGENTS.md format.** Intentionally minimal: a markdown file at a predictable path,
   no required fields, no schema, no version. Stability is the feature. Changes here affect
   every agent that reads the file and every repository that ships one.
2. **The agents.md website.** Documentation, examples, FAQ, and the list of tools that
   support the format. This is where nearly all activity belongs.

Conflating the two is the most common source of stalled proposals. A change to the website
needs a reviewer. A change to the format needs the Technical Committee.

## Roles

| Role | Can | Becomes one by |
|---|---|---|
| **Contributor** | Open issues and pull requests | Opening one |
| **Triager** | Label, close and de-duplicate issues and PRs; request changes | Being nominated by a maintainer after sustained, accurate triage |
| **Maintainer** | Merge pull requests, cut releases, manage repository settings | Being nominated by an existing maintainer and confirmed by the others, having landed a meaningful body of reviewed work |

Current holders are listed in [OWNERS.md](OWNERS.md).

The Lifecycle Policy expects Growth and Impact stage projects to have *"a diverse group of
maintainers, with multiple organizations represented"* and *"a healthy number of committers
from at least two organizations."* Nominations should be read with that goal in mind:
adding a maintainer from an organization not already represented is a benefit, not a risk.

### Becoming a triager

Triage is the bottleneck, so this is the most useful way in and deliberately the easiest
step to earn. Demonstrate it before asking for it: comment on open issues and PRs with the
verification the reviewer would otherwise have to do themselves. For a compatibility entry
that means checking the evidence link and saying plainly whether it shows the tool reading
`AGENTS.md`. After a stretch of that, ask a maintainer, or open an issue titled
`Request: triage access`.

### Becoming a maintainer

Nomination by an existing maintainer, in a public issue, with the nominee's consent.
Confirmed by lazy consensus among maintainers over five working days: no objection means
approved. An objection moves the decision to the Technical Committee.

### Stepping down and inactivity

Maintainers may step down at any time by opening a pull request against
[OWNERS.md](OWNERS.md). A maintainer who has not reviewed or merged anything for six months
may be moved to emeritus by the remaining maintainers, or by the Technical Committee if
none are active. Emeritus status is a statement about availability, not about standing, and
is reversible on request.

If **no** maintainer is active, escalate to the Technical Committee via an issue in
[aaif/project-proposals](https://github.com/aaif/project-proposals) or by emailing
`support@aaif.io`. The Lifecycle Policy's Emeritus Stage exists for projects that have
genuinely ended; a project with heavy adoption and an idle queue is a staffing problem, not
an end-of-life one, and should be raised as such.

## Decisions

**Routine changes** (compatibility entries, typos, broken links, FAQ clarifications,
dependency bumps) are merged by any maintainer once the requirements in
[CONTRIBUTING.md](CONTRIBUTING.md) are met. No second reviewer required.

**Contested changes** (site redesigns, restructuring documentation, anything a maintainer
has objected to) use lazy consensus: a proposal in an issue, five working days, no
outstanding objection from a maintainer. Objections must state what would resolve them.

**Format changes** are not decided in this repository. They require an issue in
[aaif/project-proposals](https://github.com/aaif/project-proposals) and Technical Committee
review, because they bind every implementing tool. A pull request that changes the format
without that review will be closed with a pointer here, regardless of merit.

**Security issues** should be reported privately to the maintainers listed in
[OWNERS.md](OWNERS.md), or to `support@aaif.io`, rather than opened as public issues.

## Meetings and communication

This project has no standing meeting of its own. Discussion happens in GitHub issues and
pull requests, which keeps the record public and asynchronous across time zones.

Foundation-level venues:

- [AAIF Discord](https://discord.com/invite/9zTwngHAMy)
- `support@aaif.io`
- The Technical Committee meets biweekly on Tuesdays at 1:00pm PT. Working Groups are open
  to the public; the closest in scope to this project is **Workflows & Process
  Integration**. See the
  [public meeting calendar](https://zoom-lfx.platform.linuxfoundation.org/meetings/agentic-ai-foundation).

## Changing this document

By the process in [Decisions](#decisions) for contested changes: an issue, five working
days, lazy consensus among maintainers. Changes that affect the relationship between this
project and the Foundation additionally need Technical Committee agreement.

## Code of Conduct

The [Linux Foundation Code of Conduct](https://lfprojects.org/policies/code-of-conduct/)
applies to all project spaces.
