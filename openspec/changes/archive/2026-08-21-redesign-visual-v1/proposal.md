# Proposal: Redesign Visual V1

## Intent

Adapt the V1 brand visual identity (deep blue gradients, green accents, card patterns) to the V2 architecture — currently using generic Tailwind-inspired colors with no brand identity. This blocks user acceptance; the V2 must look and feel like the V1 professional brand.

## Scope

### In Scope
- V1 brand color tokens added as semantic layer in shared variables.css
- client-site: Header, Footer, Layout, Cards, Buttons, Page headers — full V1 design
- recruiter-site: Same layout/component patterns as client-site
- admin-panel: CSS Modules creation + brand colors on header/sidebar
- Polish: Animations, responsive verification, contrast check

### Out of Scope
- New V2 features not present in V1 (carousel macOS mockup, niche marquee, process steps)
- Font change (keep Inter unless user prefers system-ui)
- JS behavior changes beyond scroll-state effects on header shadow
- Testing infrastructure (no frontend test infra exists)

## Capabilities

### New Capabilities
None — pure visual redesign, no new spec-level behavior.

### Modified Capabilities
None — all 5 existing specs (recruiter-home, recruiter-blog, recruiter-contact, recruiter-layout, recruiter-projects) remain unchanged at the requirements level. Only visual presentation changes.

## Current State

V2 uses a Tailwind-inspired scale token system: `--color-primary-50→900` (generic blues), `--color-secondary-50→900` (grays), white/light backgrounds. Header is white/sticky. Footer is dark neutral. Cards have full borders. No gradient headers. Buttons are inconsistent per page. Admin panel uses inline styles. No brand identity.

## Target State

V2 adopts V1's distinctive brand: dark blue gradient backgrounds (`#192950` → `#21497B`) on header/footer/hero/CTA, green accent interactions (`#3E985D`, `#7CBD68`) on buttons/badges/hover/active, cards with signature 3px green left border, fixed gradient header with green bottom border, gradient footer with green top border and social icons, rich shadows, smooth transitions, professional depth.

## Approach

**Dual token strategy**: Add V1 semantic tokens (e.g. `--color-blue-base`) alongside existing scale tokens in `variables.css` — existing code keeps working, components migrate one by one. CSS Modules maintained throughout. client-site first (most public-facing), then recruiter-site (same patterns), then admin-panel (CSS Modules prerequisite).

## Phases

| Phase | Focus | Deliverables |
|-------|-------|-------------|
| **F0 Prerequisite** | Audit admin-panel, add CSS Modules to layout components. Create shared Button component. | Admin Header/Sidebar/DashboardLayout CSS Modules, Button component |
| **F1 Shared Tokens** | Add V1 brand colors, typography, shadows, transitions to `packages/shared/src/styles/variables.css` | Dual token layer — existing tokens untouched |
| **F2 Client Layout** | Rewrite Header (gradient, fixed, green border, green nav underline), Footer (gradient, green top border, grid, social icons), Layout wrapper | 4 CSS files + 2 TSX files |
| **F3 Client Components** | Cards (service/product/tool/case — green left border), Badges (green bg), Buttons (blue primary, green hover) | 5-6 CSS module files |
| **F4 Client Pages** | Home hero (gradient+overlay+badges+CTAs), Services/Contact page gradient headers, section patterns | 3-5 page CSS files |
| **F5 Recruiter Site** | Apply F2+F3 patterns to recruiter-site — Header, Footer, Cards, Buttons, Page styles | ~10 files |
| **F6 Admin Panel** | Adopt brand colors in CSS Modules, green active states, shared form styles | ~8 files |
| **F7 Polish** | Animations (fade-in, slide-up), responsive verification, WCAG AA contrast, cross-frontend consistency | globals.css additions |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/shared/src/styles/variables.css` | Modified | Add V1 semantic color/shadow/transition tokens |
| `client-site/src/components/layout/Header.module.css` | Rewrite | Gradient bg, fixed, green border, nav styling |
| `client-site/src/components/layout/Header.tsx` | Modified | Scroll-state shadow behavior |
| `client-site/src/components/layout/Footer.module.css` | Rewrite | Gradient bg, green top border, social icons |
| `client-site/src/components/layout/Footer.tsx` | Modified | Add social icons section |
| `client-site/src/components/layout/Layout.module.css` | Modified | Main padding-top for fixed header |
| `client-site/src/styles/globals.css` | Modified | Body bg, link colors, container padding |
| `client-site/src/components/{services,products,blog,successCases,tools}/*Card.module.css` | Modified | Green left border, V1 badge colors |
| `client-site/src/pages/{Home,Services,Contact}/*.module.css` | Modified | Gradient page headers, section bg |
| `client-site/src/components/common/Carousel.module.css` | Modified | macOS mockup styling |
| `recruiter-site/src/components/layout/Header.*` | Rewrite | Match client-site pattern |
| `recruiter-site/src/components/layout/Footer.*` | Rewrite | Gradient, grid, social icons |
| `recruiter-site/src/index.css` | Modified | Global styles matching V1 |
| `admin-panel/src/components/layout/Header.tsx` | Rewrite | CSS Module + gradient brand header |
| `admin-panel/src/components/layout/Sidebar.tsx` | Rewrite | CSS Module + V1 blue-base |
| `admin-panel/src/components/layout/DashboardLayout.tsx` | Rewrite | CSS Module |
| `admin-panel/src/index.css` | Rewrite | Import shared variables |

Estimate: ~35-40 files across the monorepo.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Token renaming breaks existing refs | High | Dual token approach — old tokens stay, new ones added alongside |
| Admin panel inline styles = extra work | Med | F0 adds CSS Modules first; clean prerequisite |
| 3 frontends = 3x effort | Med | Establish pattern in client-site F2→F4, reuse in F5→F6 |
| Style regressions in existing features | Med | `pnpm build` + manual visual check per phase; git commits after each phase |

## Rollback Plan

Each phase independently revertible via `git revert <phase-commit>`. Git commit after each phase completes. Dual token strategy means F1 (token addition) never breaks existing code — F2+ migrations are per-component and can be rolled back individually.

## Dependencies

- No new npm packages (pure CSS change)
- F0 prerequisite: admin-panel CSS Modules must exist before F6

## Success Criteria

- [ ] V1 brand colors render correctly in all 3 frontends (gradient headers/footers, green accents, card patterns)
- [ ] Existing V2 components unaffected where not yet migrated (dual tokens preserve them)
- [ ] All 3 frontends build without errors (`pnpm -r run typecheck`)
- [ ] Fixed header with proper z-index and padding compensation across breakpoints
- [ ] admin-panel no longer uses inline styles for layout (Header, Sidebar, DashboardLayout)
- [ ] Contrast passes WCAG AA for all new color combinations
- [ ] Responsive layout verified at 375px / 768px / 1440px per frontend
