# UI Task Notes

## Scope
- Pages Router app; page shell starts in `pages/index.tsx`.
- Global app chrome/meta is in `pages/_app.tsx`.
- Reusable sections live in `components/`.
- Global styles are `styles/globals.css` and `styles/marquee.css`.

## Working style
- Keep UI diffs small and section-scoped.
- Reuse existing spacing/typography tokens before adding new ones.
- Preserve current dark/light behavior already used in components.
- Avoid changing copy outside the task scope.

## Quick checks
- Run `pnpm dev` and verify `http://localhost:3000`.
- Check desktop + mobile widths for touched sections.
- Confirm links, anchors, and CTA buttons still work.
- Confirm no layout shift or overflow in touched cards/sections.
