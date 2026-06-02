# Tasks: Client Site Responsive Polish

## Phase 1: Design Tokens & Shared Infrastructure

- [x] 1.1 Add `--header-height` to `:root` in `packages/shared/src/styles/variables.css` with responsive overrides (80/70/64/56px at 480/768/1024px)
- [x] 1.2 Add `useEffect` + `matchMedia` listeners in `Carousel.tsx` to set responsive `slidesToShow` (1 / 2 / 3 based on 640/1024px breakpoints)
- [x] 1.3 Update Carousel button colors from `--color-primary` to `--color-blue-ui` (default) and `--color-blue-medium` (hover) in `Carousel.module.css`

## Phase 2: Component Fixes

- [x] 2.1 Replace hardcoded colors (`#888`, `#1a1a2e`, `#666`) and font sizes (`2rem`) with design tokens; add 2-column grid breakpoint at 640px in `ProductCarousel.module.css`
- [x] 2.2 Replace emoji icons (📧📱📍) with inline `<svg>` components using `fill="currentColor"` and `aria-hidden="true"` in `Contact/index.tsx`
- [x] 2.3 Change `.detailIcon` from `font-size` to `width`/`height` for SVG sizing in `Contact.module.css`
- [x] 2.4 Add differentiated empty-state logic in `Blog/index.tsx`: check `searchParams` for search/category → show filter message + "Limpiar filtros" link, else "No hay artículos publicados aún"
- [x] 2.5 Add reset-link styles (`.emptyLink`, `.emptySubtitle`) for blog empty state in `Blog.module.css`

## Phase 3: Visual Polish

- [x] 3.1 Replace hardcoded heights in `Header.module.css` (`.container` height, `.navMobile` top) with `var(--header-height)`
- [x] 3.2 Replace hardcoded `padding-top` in `Layout.module.css` with `var(--header-height)`
- [x] 3.3 Replace BlogCard hover shadow `0 8px 24px rgba(0,0,0,0.1)` with `--shadow-lg` in `BlogCard.module.css`
- [x] 3.4 Standardize card hover effects on ServiceCard and ProductCard: `translateY(-4px)` + `--shadow-lg` + `--transition-base` (already correct — no changes needed)
- [x] 3.5 Add `max-width: 800px` to `.content` column in both `ServiceDetail.module.css` and `ProductDetail.module.css`
- [x] 3.6 Replace ProductDetail emoji 🔗 with inline SVG icon (external link) in `ProductDetail.tsx`

## Phase 4: Verification

- [x] 4.1 Run `pnpm --filter @jsoft/client-site exec tsc --noEmit` — passes with no errors
- [x] 4.2 Run `pnpm --filter @jsoft/client-site build` — succeeds
- [x] 4.3 Manual visual review at 480/640/768/1024/1200px: check header height, carousel slides, card hover, detail layout
