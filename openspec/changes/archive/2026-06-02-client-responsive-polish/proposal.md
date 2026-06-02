# Proposal: Client Site Responsive Polish

## Intent

Eliminate hardcoded values, emoji icons, and duplicated breakpoints in the client site. Replace with design system tokens and SVG icons for consistency, maintainability, and professional look across Blog, Products, Contact, and layout components.

## Scope

### In Scope
- ProductCarousel: `#888`/`#1a1a2e`/`2rem` → design tokens
- ContactPage: emoji 📧📱📍 → inline SVG icons (Footer pattern)
- Carousel: slidesToShow responsive per viewport
- Carousel controls: `--color-primary` → `--color-blue-ui`/`--color-blue-medium`
- Header height: extract to shared `--header-height` CSS property
- Blog empty state: differentiate "no content" vs "no search results"
- Visual polish: card shadows, spacing, detail page layout

### Out of Scope
- API, admin panel, recruiter site, new features

## Capabilities

### New Capabilities
None — purely frontend polish.

### Modified Capabilities
None — visual presentation only.

## Approach

| Item | Approach |
|------|----------|
| ProductCarousel | Replace hardcoded values with `--font-size-3xl`, `--color-neutral-700`, `--color-primary-600` |
| Contact emojis | Inline SVGs matching Footer's `<svg>` pattern |
| Carousel slidesToShow | matchMedia listener + CSS breakpoints (1/2/3 slides) |
| Carousel controls | `--color-primary` → `--color-blue-ui` / `--color-blue-medium` |
| Header height | Add `--header-height` to `:root`, reference in both `.module.css` files |
| Blog empty state | Check `search`/`category` params for differentiated message |
| Visual polish | `--shadow-lg` on hover, consistent spacing, detail page width |

All changes CSS-module local — no Tailwind, no runtime deps.

## Affected Areas

| Area | Impact |
|------|--------|
| `ProductCarousel.module.css` | Hardcoded → tokens |
| `Contact/index.tsx` | Emoji → SVGs |
| `Carousel.tsx` | Responsive slidesToShow |
| `Carousel.module.css` | Fix color vars |
| `Header.module.css` | Use `--header-height` |
| `Layout.module.css` | Use `--header-height` |
| `variables.css` | Add `--header-height` |
| `Blog/index.tsx` | Differentiated empty state |
| `Blog/Blog.module.css` | Empty state styles |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Token name mismatch | Low | Type check + visual review |
| Header height off | Low | Test 480/768/1024/1200px |
| Emoji removal layout | Low | SVGs use `currentColor` fill |

## Rollback Plan

Git revert of changed files. No DB migrations — frontend only.

## Dependencies

- Design tokens in `packages/shared/src/styles/variables.css`

## Success Criteria

- [ ] All hardcoded values replaced with CSS custom properties
- [ ] Contact page uses inline SVGs only
- [ ] Carousel adapts slides per viewport (1/2/3)
- [ ] `--header-height` single source of truth
- [ ] Blog shows "no results" vs "no articles" correctly
- [ ] TypeScript typecheck passes
