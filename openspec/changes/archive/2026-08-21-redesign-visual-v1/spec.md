# Specification: Redesign Visual V1

## Overview

Adapt the V1 brand visual identity (deep blue gradients, green accents, card patterns, rich shadows) to the V2 architecture — replacing generic Tailwind-inspired colors with the J Soft Solutions professional brand. This is a pure presentation-layer change: no new features, no API changes, no routing changes.

---

## Requirements

### SR-1: Shared Design Tokens (F1)

| Token Category | Tokens | Values |
|---|---|---|
| Blue base | `--color-blue-base`, `--color-blue-medium`, `--color-blue-ui`, `--color-blue-light` | `#192950`, `#21497B`, `#25609D`, `#e0eaf5` |
| Green accents | `--color-green-backend`, `--color-green-accent`, `--color-green-accent-text` | `#3E985D`, `#7CBD68`, `#4E9A3B` |
| Shadows (V1) | `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl` | V1 values (softer, deeper than current) |
| Transitions | `--transition-fast`, `--transition-base`, `--transition-slow`, `--transition-slower` | `0.15s`, `0.2s`, `0.3s`, `0.5s` |
| Spacing | `--spacing-xs` through `--spacing-3xl` | `0.25rem` increments up to `3rem` |
| Radius | `--radius-none`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full` | `0` to `9999px` |
| Z-index | `--z-dropdown` through `--z-toast` | Matching V1 scale |

SR-1.1: MUST add V1 brand colors as semantic tokens to `packages/shared/src/styles/variables.css` without removing existing scale tokens (dual token strategy).
SR-1.2: MUST include all shadow, transition, spacing, radius, and z-index tokens matching V1.

### SR-2: Header Component (F2 client-site, F5 recruiter-site)

SR-2.1: MUST render gradient background (`135deg #192950 → #21497B`), position fixed at top, z-index 1000, 3px solid bottom border in `#7CBD68` (green-accent).
SR-2.2: MUST hide when scrolling down past 100px threshold, show when scrolling up.
SR-2.3: MUST display logo at 58px height (desktop) / 42px (mobile).
SR-2.4: Nav links MUST have underline animation on hover — green line expanding from center to full width.
SR-2.5: Active nav link MUST be highlighted with green accent (`#7CBD68`).
SR-2.6: On mobile (≤768px) MUST show hamburger toggle with animated X transition; mobile nav MUST be full-screen overlay with gradient background.
SR-2.7: MUST respect `prefers-reduced-motion` — disable scroll hide/show animation and hover transitions.

### SR-3: Footer Component (F2 client-site, F5 recruiter-site)

SR-3.1: MUST render gradient background (`135deg #192950 → #21497B`), 3px solid top border in `#4E9A3B` (green-accent-text).
SR-3.2: MUST use grid layout: 2fr 1fr 1fr on desktop (≥1024px), 2 columns on tablet (640–1023px), 1 column on mobile (≤480px).
SR-3.3: MUST include social media icon links (WhatsApp, LinkedIn, GitHub, email) rendered as 40×40px circles with green accent on hover.
SR-3.4: MUST include brand name, description, link lists, and copyright notice.

### SR-4: Cards (F3 client-site, F5 recruiter-site)

SR-4.1: MUST have white background (`#ffffff`), 3px solid left border in `#3E985D` (green-backend), radius `--radius-lg` (1rem/16px).
SR-4.2: MUST show `--shadow-md` by default, transition to `--shadow-lg` + `translateY(-4px)` on hover.
SR-4.3: Badge component MUST be uppercase, 0.65rem, `#3E985D` color with 10% opacity background.
SR-4.4: Card titles MUST be `#192950` (blue-base); card body text MUST be `#4b5563` (gray-600).
SR-4.5: All card variants (services, products, tools) MUST use identical green left border styling.

### SR-5: Buttons / UI (F3, F5, F6)

SR-5.1: Primary button: `#25609D` (blue-ui) background, white text. Hover: `#4E9A3B` (green-accent-text) background, white text, `translateY(-2px)`, `--shadow-md`.
SR-5.2: Secondary/outline button: transparent background, `#25609D` border and text.
SR-5.3: WhatsApp button: `#128C7E` background, green shadow on hover.
SR-5.4: All buttons MUST have `min-height: 44px` (touch target) and transition `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`.

### SR-6: Hero Sections (F4 client-site, F5 recruiter-site)

SR-6.1: MUST render gradient background (`135deg #192950 → #21497B`) with `rgba(25, 41, 80, 0.85)` overlay, `min-height: 80vh` on desktop.
SR-6.2: Badges MUST use `backdrop-filter: blur`, white text, pill shape (`--radius-full`).
SR-6.3: h1 title MUST be white, with green-accent (`#7CBD68`) for highlighted text spans.
SR-6.4: MUST include primary CTA button + secondary/WhatsApp button.

### SR-7: Page Headers (F4, F5, F6)

SR-7.1: MUST render gradient background (`135deg #192950 → #21497B`), white title text, subtitle in `rgba(255,255,255,0.9)`.

### SR-8: Animations (F7)

SR-8.1: MUST implement fade-in animation on page content load.
SR-8.2: MUST implement slide-up animation for cards entering viewport.
SR-8.3: MUST implement shimmer/skeleton loading animation.
SR-8.4: ALL animations MUST respect `prefers-reduced-motion` — set `transition-duration: 0s` and `animation: none`.

### SR-9: Admin Panel (F6)

SR-9.1: Header MUST use CSS Modules with gradient background matching brand.
SR-9.2: Sidebar MUST use `#192950` (blue-base) background.
SR-9.3: Active nav items MUST use green accent (`#7CBD68`) for highlight.
SR-9.4: All layout styles MUST use CSS Modules (no inline styles for Header, Sidebar, DashboardLayout).

### SR-10: Cross-Cutting

SR-10.1: MUST maintain TypeScript 0 errors across all packages (`pnpm -r run typecheck`).
SR-10.2: MUST maintain 62/62 passing API tests (`pnpm --filter @jsoft/api test`).
SR-10.3: Each phase (F0–F7) MUST be independently revertible via `git revert`.
SR-10.4: MUST maintain responsive design at 3 breakpoints: 375px / 768px / 1440px.
SR-10.5: MUST use `@media (hover: hover)` for hover effects.
SR-10.6: MUST respect `prefers-reduced-motion` on all animations and transitions.

---

## Scenarios

### SR-2: Header

**Scenario: Header gradient and border render correctly**
- GIVEN the user visits any page on client-site
- WHEN the page loads
- THEN the header MUST display a gradient from `#192950` to `#21497B` at 135deg
- AND the header MUST have a 3px bottom border in `#7CBD68`

**Scenario: Nav link underline animation on hover**
- GIVEN the user hovers over a nav link
- WHEN the hover state triggers
- THEN a green underline (`#7CBD68`) MUST animate from center outward to full width

**Scenario: Header hides on scroll down, shows on scroll up**
- GIVEN the page has scrolled past 100px
- WHEN the user scrolls down
- THEN the header MUST slide up and out of view (translateY(-100%))
- WHEN the user scrolls up
- THEN the header MUST slide back into view

**Scenario: Mobile hamburger menu toggles full-screen overlay**
- GIVEN the viewport is ≤768px
- WHEN the user clicks the hamburger toggle
- THEN the nav overlay MUST appear with gradient background
- AND the hamburger lines MUST animate into an X
- WHEN the user clicks the toggle again
- THEN the nav overlay MUST disappear
- AND the X MUST animate back into hamburger lines

**Scenario: Header logo responsive sizing**
- GIVEN the header renders
- WHEN the viewport is ≥769px
- THEN the logo MUST render at 58px height
- WHEN the viewport is ≤768px
- THEN the logo MUST render at 42px height

### SR-3: Footer

**Scenario: Footer gradient and border render correctly**
- GIVEN the user visits any page
- WHEN the page renders
- THEN the footer MUST display a gradient from `#192950` to `#21497B` at 135deg
- AND the footer MUST have a 3px top border in `#4E9A3B`

**Scenario: Footer grid adapts to viewport**
- GIVEN the footer renders
- WHEN the viewport is ≥1024px
- THEN the grid MUST use 2fr 1fr 1fr columns
- WHEN the viewport is 480–1023px
- THEN the grid MUST use 2 columns
- WHEN the viewport is ≤480px
- THEN the grid MUST use 1 column

### SR-4: Cards

**Scenario: Card hover elevation**
- GIVEN the user hovers over a card
- WHEN the hover state triggers
- THEN the card MUST translateY(-4px)
- AND the card MUST show `--shadow-lg`
- AND the transition MUST be smooth (0.2s ease-in-out)

**Scenario: Card green left border renders**
- GIVEN any card (service, product, or tool) renders
- WHEN the card is displayed
- THEN it MUST have a 3px solid left border in `#3E985D`
- AND rounded corners at `--radius-lg`

**Scenario: Badge renders with V1 styling**
- GIVEN a card has a badge
- WHEN the badge renders
- THEN it MUST be uppercase, 0.65rem font-size, `#3E985D` color
- AND the background MUST be `#3E985D` at 10% opacity

### SR-5: Buttons

**Scenario: Primary button hover transition**
- GIVEN a primary button is rendered
- WHEN the user hovers over it
- THEN the background MUST change from `#25609D` to `#4E9A3B`
- AND the button MUST translateY(-2px)
- AND shadow MUST increase to `--shadow-md`
- AND transition MUST use `0.3s cubic-bezier(0.4, 0, 0.2, 1)`

**Scenario: Touch targets meet accessibility**
- GIVEN any interactive element (button, link, input)
- WHEN rendered
- THEN it MUST have `min-height: 44px`

### SR-6: Hero

**Scenario: Hero gradient and overlay render**
- GIVEN the user visits the home page
- WHEN the hero section renders
- THEN the background MUST be a gradient from `#192950` to `#21497B` at 135deg
- AND an overlay with `rgba(25, 41, 80, 0.85)` MUST be present
- AND `min-height` MUST be 80vh on desktop

**Scenario: Hero badges use backdrop blur**
- GIVEN a badge renders in the hero section
- WHEN displayed
- THEN it MUST have `backdrop-filter: blur`, white text, and pill shape (`--radius-full`)

### SR-8: Animations

**Scenario: Fade-in on page load**
- GIVEN the user navigates to any page
- WHEN the page content loads
- THEN content MUST fade in from opacity 0 to 1

**Scenario: Slide-up on card entering viewport**
- GIVEN a card is below the viewport
- WHEN it scrolls into view
- THEN it MUST slide up (translateY(20px) → translateY(0)) while fading in

**Scenario: Reduced motion disables animations**
- GIVEN the user has `prefers-reduced-motion: reduce`
- WHEN any animation or transition would trigger
- THEN `transition-duration` MUST be 0s
- AND `animation` MUST be none
- AND scroll-based header hide/show MUST NOT play

### SR-9: Admin Panel

**Scenario: Admin sidebar uses V1 blue-base**
- GIVEN the admin panel renders
- WHEN the sidebar is displayed
- THEN its background MUST be `#192950` (blue-base)

**Scenario: Admin active nav uses green accent**
- GIVEN the admin panel renders
- WHEN a nav item is active
- THEN it MUST be highlighted with green accent (`#7CBD68`)

### SR-10: Cross-Cutting

**Scenario: TypeScript compiles with zero errors**
- GIVEN all packages are built
- WHEN `pnpm -r run typecheck` executes
- THEN it MUST exit with code 0
- AND there MUST be zero TypeScript errors

**Scenario: API tests pass**
- GIVEN the API package
- WHEN `pnpm --filter @jsoft/api test` executes
- THEN all 62 tests MUST pass

**Scenario: Hover effects only on hover-capable devices**
- GIVEN a hover effect is defined (card elevate, button transition, nav underline)
- WHEN inspected in CSS
- THEN it MUST be wrapped in `@media (hover: hover)`

**Scenario: Responsive at 3 breakpoints**
- GIVEN the application renders
- WHEN viewed at 375px, 768px, and 1440px
- THEN all components MUST render without overlap, overflow, or broken layout

---

## Non-Goals

- Do NOT change the API, database schema, or Prisma models
- Do NOT change content, text copy, or page structure
- Do NOT change routing, navigation URLs, or page hierarchy
- Do NOT add new pages or routes
- Do NOT change the admin panel's functional layout (only visual styling via CSS Modules)
- Do NOT install new npm packages (pure CSS change)
- Do NOT modify the existing scale tokens in `variables.css`

---

## Open Questions

1. **Animations parity**: Are there specific V1 scroll-triggered animations (fade-in on reveal, parallax, counters) that MUST be replicated exactly, or is a simpler fade-in/slide-up sufficient?

2. **Recruiter site hero**: Should the recruiter site use the full hero section (gradient, overlay, badges, CTAs) identical to client-site, or should it be a simpler page header variant?

3. **Admin panel header**: Should the admin panel header match the public sites exactly (gradient, green border, scroll behavior) or use a simplified version with just the gradient background?

4. **Social icons**: Which specific social platforms must be linked? (WhatsApp confirmed; LinkedIn, GitHub, email — what else?)

5. **Logo asset**: Is the V1 logo an SVG/text with brand font, or should it remain as text "J Soft Solutions" with updated visual styling?
