# SKYGRID Heavy Traffic Website Readiness

## Purpose

This runbook documents the public website readiness path for large traffic events.

## Architecture

The website should be:

- edge-first
- cache-forward
- static where possible
- observable through a public health file
- connected to separate backend services for live proof work

## Current website hardening

The committed Vercel configuration adds:

- long-lived immutable caching for Next.js static assets
- long-lived immutable caching for public assets and logos
- short caching for `/health.json`
- stale-while-revalidate caching for normal website pages
- public response headers identifying the SKYGRID Option B mode
- basic browser security headers

## Public health file

The site includes:

```text
/health.json
```

This file is intended for edge checks, uptime monitoring, and future failover checks.

## Optional CloudFront failover

For high-traffic campaigns, place CloudFront in front of the public site.

Recommended pattern:

- Primary origin: Vercel website
- Secondary origin: AWS static mirror
- Health object: `/health.json`
- Failover trigger: selected 5xx responses or connection failure

## Proof checklist

Before calling the site heavy-traffic ready:

1. `pnpm install --frozen-lockfile` passes.
2. `pnpm build` passes in CI or Vercel.
3. `/health.json` is publicly reachable.
4. Static assets return immutable cache headers.
5. Main pages return stale-while-revalidate cache headers.
6. The optional CloudFront failover path is tested if CloudFront is enabled.

## Safe public claim

SKYGRID Option B is configured as a local-first, cloud-reserve architecture with an edge-cached website front door and a public health manifest for monitoring and future failover checks.
