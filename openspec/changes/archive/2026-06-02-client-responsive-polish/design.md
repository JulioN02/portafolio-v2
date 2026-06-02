# Design: Client Site Responsive Polish

## Overview

Frontend-only polish across 6 domains: ProductCarousel token migration, Contact SVG icons, Carousel responsive slides, Header height single source of truth, Blog differentiated empty state, and visual card/detail polish. All changes are CSS Modules + zero-runtime dependencies.

## Technical Approach

Rooted in spec requirements; each domain maps to one spec file. Uses existing design tokens (`variables.css`) and Footer's inline SVG pattern as reference. No API changes, no new dependencies.

## Architecture Decisions

### Decision: `--header-height` lives in `variables.css`
**Choice**: Define `--header-height` on `:root` in the shared variables file with 4 breakpoints, then reference from Header and Layout CSS modules.
**Alternatives**: Define in a scoped CSS module and re-export — rejected because Layout and Header are sibling components; a shared `:root` property is simpler and follows the token pattern.
**Rationale**: Eliminates duplicated magic numbers across two files (Header height 80px, Layout padding-top 80px) and hardcoded breakpoints. If the height changes, only `variables.css` changes.

### Decision: `matchMedia` JS hook for Carousel responsive, not CSS-only
**Choice**: Add a `useEffect` with `matchMedia` listeners that set responsive `slidesToShow` based on viewport width, feeding into the existing `--slides-to-show` CSS variable. Keep current CSS media queries as fallback.
**Alternatives**: Pure CSS with `flex-basis` media queries — rejected per spec requirement for JS-driven slidesToShow; also Embla's `slidesToShow` prop enables future programmatic control (e.g., slide count change on orientation).
**Rationale**: The current Carousel already uses `--slides-to-show` — this extends it with JS-driven viewport detection. The 640px breakpoint aligns with the design system references.

### Decision: `<svg aria-label>` on Contact icons (vs `aria-hidden`)
**Choice**: Add `aria-label` on the SVG element for each icon (email, phone, location) following the spec, using `fill="currentColor"` matching the Footer pattern.
**Alternatives**: `aria-hidden="true"` — used by Footer (icons inside links with labels). Contact icons sit alongside visible `<h3>` text, so `aria-label` provides explicit description per spec.
**Rationale**: The spec explicitly requires `aria-label`. Current emoji characters are announced by screen readers — replacing with SVGs that have `aria-label` preserves accessibility.

### Decision: Blog empty state reads URL search params, not API response
**Choice**: Check `searchParams.get('search')` and `searchParams.get('category')` at render time (already available from `useSearchParams`) to decide empty-state message. No additional API call.
**Alternatives**: Check API response metadata — rejected because we already have URL params in scope from the existing component.
**Rationale**: Zero additional overhead. The existing `search` and `category` variables in the component already parse these. When `posts.length === 0`, just check if either param is truthy.

### Decision: Detail page content width constrained with `.content` max-width
**Choice**: Add `max-width: 800px` to the content column in ServiceDetail and ProductDetail grid layouts, not the entire grid.
**Alternatives**: Constrain the whole `.grid` — rejected because it would also shrink the image gallery, which should remain full-width per the 2-column layout.
**Rationale**: The image gallery benefits from full width while text content becomes harder to read past ~66 characters per line. 800px is a standard readable measure.

## File Changes

| File | Action | Grounded In |
|------|--------|-------------|
| `packages/shared/src/styles/variables.css` | Modify | Add `--header-height` with responsive `@media` overrides |
| `client-site/src/components/products/ProductCarousel.module.css` | Modify | Replace hardcoded colors/fonts with tokens; add 640px 2-col breakpoint; use `--shadow-lg` on hover |
| `client-site/src/components/products/ProductCarousel.tsx` | No change | Presentational only — CSS handles everything |
| `client-site/src/pages/Contact/index.tsx` | Modify | Replace emoji 📧📱📍 with inline `<svg>` icons with `aria-label` and `currentColor` |
| `client-site/src/pages/Contact/Contact.module.css` | Modify | Update `.detailIcon` from `font-size` to `width`/`height` for SVG sizing |
| `client-site/src/components/common/Carousel.tsx` | Modify | Add `useEffect` + `matchMedia` for responsive `slidesToShow` (1/2/3 slides) |
| `client-site/src/components/common/Carousel.module.css` | Modify | Update button colors to `--color-blue-ui` / `--color-blue-medium`; align breakpoints to design system (640px) |
| `client-site/src/components/layout/Header.module.css` | Modify | Replace hardcoded `height` values with `var(--header-height)` on `.container`; same for `.navMobile` top |
| `client-site/src/components/layout/Layout.module.css` | Modify | Replace hardcoded `padding-top` with `var(--header-height)` |
| `client-site/src/pages/Blog/index.tsx` | Modify | Add differentiated empty-state: check `search`/`category` params → filter message + "Limpiar filtros" link |
| `client-site/src/pages/Blog/Blog.module.css` | Modify | Add styles for reset button in empty state |
| `client-site/src/components/blog/BlogCard.module.css` | Modify | Replace hardcoded hover shadow `0 8px 24px rgba(0,0,0,0.1)` with `--shadow-lg` |
| `client-site/src/pages/Services/ServiceDetail.module.css` | Modify | Add `max-width: 800px` to `.content` column |
| `client-site/src/pages/Products/ProductDetail.module.css` | Modify | Add `max-width: 800px` to `.content` column |
| `client-site/src/pages/Products/ProductDetail.tsx` | Modify | Replace emoji 🔗 with SVG icon for external link |

## Data Flow

```
── ProductCarousel ──
  CSS Module (tokens) → Component renders with theme colors

── Carousel Responsive ──
  matchMedia('(max-width: 639px)') → responsiveSlides = 1
  matchMedia('(min-width: 640px) and (max-width: 1023px)') → responsiveSlides = 2
  otherwise → responsiveSlides = 3
  ↓
  slidesToShow prop → --slides-to-show CSS var → Embla slide width

── Blog Empty State ──
  useSearchParams → search, category
  ↓
  posts.length === 0?
  ├─ search || category truthy → "No se encontraron artículos..." + reset link
  └─ neither truthy → "No hay artículos publicados aún"

── Header Height ──
  variables.css :root --header-height
  ├─ Header.module.css → .container height, .navMobile top
  └─ Layout.module.css → .main padding-top
```

## SVG Icons (Contact Page)

| Detail | SVG Path | aria-label |
|--------|----------|------------|
| Email | `M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z` | "Correo electrónico" |
| WhatsApp/Phone | `M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z` | "WhatsApp" |
| Location | `M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z` | "Ubicación" |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Typecheck | All files | `pnpm --filter @jsoft/client-site exec tsc --noEmit` — must pass |
| Visual | All 6 domains | Manual review at 480/640/768/1024/1200px breakpoints |
| A11y | Contact SVGs | Inspect with browser devtools — SVGs must have `aria-label` |
| Build | Client site | `pnpm --filter @jsoft/client-site build` — must succeed |

## Migration / Rollout

No migration required. All changes are client-side only. Git revert of changed files for rollback. Verify `--header-height` doesn't cause layout shift by cross-referencing old hardcoded values (80px default matches current).

## Open Questions

- [ ] None. Specs are complete and unambiguous.
