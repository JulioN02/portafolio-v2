# Tasks: Redesign Visual V1

## Phase Breakdown

### Dependency Map
```
F0 (Admin CSS Modules) ──→ F6 (Admin Styling) — prerequisite
F1 (Shared Tokens) ──→ F2, F3, F4, F5, F6, F7 — tokens needed everywhere
F2 (Client Layout) ──→ F4 (Client Pages) — layout before pages
F3 (Components) ──→ F4, F5 — shared components before usage
F2 ──→ F5 — client layout pattern for recruiter
F3 ──→ F5 — shared components for recruiter
F4, F5, F6 ──→ F7 — all styled before polish
```

### Commit Strategy
Each phase gets one commit. Phases are independently revertible via `git revert`.

---

## Phase F0: Prerequisites — Admin Panel CSS Modules

> **Goal**: Audit admin-panel inline styles and extract them into CSS Modules before applying V1 brand colors.
> **Commit**: `feat(admin): extract layout components to CSS Modules`

### Task F0.1: Audit admin-panel — list all inline styles vs CSS Modules
**Phase**: F0
**Files**:
- read: admin-panel/src/components/layout/Header.tsx (full inline styles — audit)
- read: admin-panel/src/components/layout/Sidebar.tsx (full inline styles — audit)
- read: admin-panel/src/components/layout/DashboardLayout.tsx (full inline styles — audit)
**Acceptance Criteria**:
1. [ ] Document all inline style properties per component
2. [ ] Identify all hardcoded color, spacing, layout values to extract
3. [ ] Confirm no other admin components use inline styles for layout

### Task F0.2: Create CSS Modules for admin-panel Header
**Phase**: F0
**Files**:
- create: admin-panel/src/components/layout/Header.module.css (extract from inline: height 60px, white bg, border-bottom, flex layout, padding, gap)
**Acceptance Criteria**:
1. [ ] Header.module.css exists with `.header` class matching current visual output
2. [ ] All inline styles from Header.tsx are removed and replaced by className={styles.header}
3. [ ] No visual regression — header renders identically to before

### Task F0.3: Create CSS Modules for admin-panel Sidebar
**Phase**: F0
**Files**:
- create: admin-panel/src/components/layout/Sidebar.module.css (extract from inline: width 240px/60px collapsed, #1a1a2e bg, min-height 100vh, padding, nav links)
**Acceptance Criteria**:
1. [ ] Sidebar.module.css exists with `.sidebar`, `.collapsed`, `.navLink`, `.active` classes
2. [ ] All inline styles from Sidebar.tsx are removed and replaced by CSS Module classNames
3. [ ] Collapse/expand toggle works identically (width transition preserved)

### Task F0.4: Create CSS Modules for admin-panel DashboardLayout
**Phase**: F0
**Files**:
- create: admin-panel/src/components/layout/DashboardLayout.module.css (extract: flex display, min-height, main padding, background)
- modify: admin-panel/src/components/layout/DashboardLayout.tsx (replace inline styles with CSS Module)
**Acceptance Criteria**:
1. [ ] DashboardLayout.module.css exists with `.layout`, `.mainContent` classes
2. [ ] All inline styles from DashboardLayout.tsx are removed
3. [ ] Layout renders identically — sidebar + header + main content area unchanged

### Task F0.5: Update admin-panel ProtectedLayout imports (if needed)
**Phase**: F0
**Files**:
- read: admin-panel/src/components/layout/ProtectedLayout.tsx (check for inline styles)
**Acceptance Criteria**:
1. [ ] ProtectedLayout uses CSS Modules or has no inline styles to extract
2. [ ] No visual regressions in admin routing

---

## Phase F1: Shared Design Tokens

> **Goal**: Add V1 brand color tokens, shadow tokens, transition tokens, spacing, radius, and z-index tokens to `variables.css` without removing existing scale tokens (dual token strategy).
> **Commit**: `feat(shared): add V1 brand design tokens`

### Task F1.1: Add V1 brand color tokens
**Phase**: F1
**Files**:
- modify: packages/shared/src/styles/variables.css (add color tokens section)
**New tokens**:
```
--color-blue-base: #192950
--color-blue-medium: #21497B
--color-blue-ui: #25609D
--color-blue-light: #e0eaf5
--color-green-backend: #3E985D
--color-green-accent: #7CBD68
--color-green-accent-text: #4E9A3B
--color-green-backend-text: #2D7A4A
```
**Acceptance Criteria**:
1. [ ] All 8 brand color tokens added under `/* ── V1 Brand Colors ── */` section
2. [ ] Existing `--color-primary-*` and `--color-secondary-*` tokens remain untouched
3. [ ] Tokens are in rgba hex format matching V1 exactly

### Task F1.2: Add V1 shadow tokens
**Phase**: F1
**Files**:
- modify: packages/shared/src/styles/variables.css (add/update shadow tokens)
**New tokens**:
```
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.07)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15)
```
**Acceptance Criteria**:
1. [ ] All 4 shadow tokens added with rgba() syntax (not rgb() space syntax)
2. [ ] Shadow values match V1 exactly — softer, deeper than current
3. [ ] Existing shadow tokens updated in place (same names, updated values)

### Task F1.3: Add V1 transition tokens
**Phase**: F1
**Files**:
- modify: packages/shared/src/styles/variables.css (add transition tokens)
**New tokens**:
```
--transition-fast: 0.15s ease-in-out
--transition-base: 0.2s ease-in-out
--transition-slow: 0.3s ease-in-out
--transition-slower: 0.5s ease-in-out
```
**Acceptance Criteria**:
1. [ ] All 4 transition tokens added
2. [ ] Existing `--transition-normal` kept for backward compatibility
3. [ ] Add `prefers-reduced-motion` override block that sets all to 0s

### Task F1.4: Add V1 easing tokens
**Phase**: F1
**Files**:
- modify: packages/shared/src/styles/variables.css (add easing/cubic-bezier tokens)
**New tokens**:
```
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```
**Acceptance Criteria**:
1. [ ] All 3 easing tokens added matching V1
2. [ ] Tokens usable in transition and animation properties

### Task F1.5: Add V1 spacing tokens (2xl, 3xl)
**Phase**: F1
**Files**:
- modify: packages/shared/src/styles/variables.css (add missing spacing tokens)
**New tokens**:
```
--spacing-2xl: 3rem   /* 48px */
--spacing-3xl: 4rem   /* 64px */
```
**Acceptance Criteria**:
1. [ ] `--spacing-2xl` and `--spacing-3xl` added after existing --spacing-xl
2. [ ] Existing spacing tokens untouched

### Task F1.6: Add V1 radius (none, xl)
**Phase**: F1
**Files**:
- modify: packages/shared/src/styles/variables.css (add missing radius tokens)
**New tokens**:
```
--radius-none: 0
```
Note: --radius-xl already exists as 0.75rem, --radius-lg is 0.5rem — V1 radius-lg is 1rem, radius-xl is 1.5rem, so update carefully.
**Acceptance Criteria**:
1. [ ] `--radius-none: 0` added
2. [ ] Check if --radius values match V1 expectations, update if needed

### Task F1.7: Add V1 z-index tokens
**Phase**: F1
**Files**:
- modify: packages/shared/src/styles/variables.css (add missing z-index tokens)
**New tokens**:
```
--z-fixed: 300
--z-modal-backdrop: 400
--z-modal: 401
--z-notification: 500
--z-tooltip: 600
```
**Acceptance Criteria**:
1. [ ] New z-index tokens added alongside existing (--z-dropdown: 100, --z-sticky: 200, --z-overlay: 300, --z-modal: 400, --z-toast: 500)
2. [ ] Existing tokens preserved

### Task F1.8: TypeScript check — ensure 0 errors after token changes
**Phase**: F1
**Files**:
- run: `pnpm -r run typecheck` from project root
**Acceptance Criteria**:
1. [ ] `pnpm -r run typecheck` exits with code 0
2. [ ] No TypeScript errors in any package
3. [ ] No CSS syntax errors in variables.css

---

## Phase F2: Client Layout — Header, Footer, Layout

> **Goal**: Rewrite client-site Header (gradient, fixed, green border, nav underline), Footer (gradient, green top border, grid, social icons), and Layout wrapper (padding-top for fixed header).
> **Commit**: `feat(client): redesign header and footer with V1 brand`

### Task F2.1: Rewrite Header.module.css — gradient background, fixed position, green border-bottom
**Phase**: F2
**Files**:
- rewrite: client-site/src/components/layout/Header.module.css
**Key CSS Changes**:
- `.header`: `position: fixed` (was sticky), `background: linear-gradient(135deg, var(--color-blue-base), var(--color-blue-medium))`, `border-bottom: 3px solid var(--color-green-accent)`, `z-index: 1000`, `transition: transform 420ms cubic-bezier(0.16,1,0.3,1)`, `will-change: transform`, `backface-visibility: hidden`
- `.hidden`: `transform: translateY(-100%)` (keep existing)
- `.container`: `max-width: 1200px`, `height: 80px` (desktop), responsive heights
- `.logo`: white text, green accent hover
- `.navLink`: white text, `position: relative` for `::after` underline
- `.navLink.active`: `color: var(--color-green-accent-text)`
- `.navLink::after`: center-expanding green underline (`left: 50%; width: 0→100%; height: 2px; background: var(--color-green-accent)`)
- `.hamburger`: `48x48`, `background: rgba(255,255,255,0.1)`, `border-radius: 12px`, hidden on desktop
- `.hamburgerLine`: white lines, animated X on open
- `.navMobile`: overlay with gradient background `linear-gradient(180deg, var(--color-blue-base), var(--color-blue-medium))`
- All hover effects wrapped in `@media (hover: hover)`
- `@media (prefers-reduced-motion: reduce)` override
**Acceptance Criteria**:
1. [ ] Header renders with `linear-gradient(135deg, #192950, #21497B)` background
2. [ ] Header has 3px solid bottom border in `#7CBD68` (--color-green-accent)
3. [ ] Header is `position: fixed` at top with `z-index: 1000`
4. [ ] Nav links have green underline animation on hover (center-expanding)
5. [ ] Active nav link shows `#4E9A3B` (--color-green-accent-text)
6. [ ] Hamburger button is `48x48` with `rgba(255,255,255,0.1)` background, shown ≤768px
7. [ ] Mobile overlay nav uses gradient background
8. [ ] Header heights responsive: 80px (≥1025px), 70px (769-1024px), 64px (481-768px), 56px (≤480px)
9. [ ] Logo sizes: 58px height (≥769px), 42px height (≤768px)
10. [ ] Hover effects wrapped in `@media (hover: hover)`

### Task F2.2: Update Header.tsx — change sticky to fixed, no JS logic changes needed
**Phase**: F2
**Files**:
- modify: client-site/src/components/layout/Header.tsx
**Changes**:
- Position change handled in CSS Module (`.header { position: fixed }`) — TSX stays the same
- Keep existing scroll-hide/show logic (already implemented)
- Keep hamburger toggle logic (already implemented)
**Acceptance Criteria**:
1. [ ] Header.tsx imports and uses updated styles
2. [ ] Scroll-hide/show behavior works (hide on scroll down >100px, show on scroll up)
3. [ ] No functional regressions

### Task F2.3: Rewrite Footer.module.css — gradient background, green top border, grid layout, social icons
**Phase**: F2
**Files**:
- rewrite: client-site/src/components/layout/Footer.module.css
**Key CSS Changes**:
- `.footer`: `background: linear-gradient(135deg, var(--color-blue-base), var(--color-blue-medium))`, `border-top: 3px solid var(--color-green-accent-text)`, `padding: var(--spacing-2xl) var(--spacing-md)`
- `.grid`: `display: grid; grid-template-columns: 2fr 1fr 1fr` (≥1024px), 2 columns (480-1023px), 1 column (≤480px), `gap: var(--spacing-xl)`
- `.socialLink`: `width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1)`, hover: green bg
- `.divider`: `height: 1px; background: rgba(255,255,255,0.1)`
- `.bottom`: `flex`, `space-between`, copyright + legal links
- All links white with green accent hover
- `@media (prefers-reduced-motion: reduce)` override
**Acceptance Criteria**:
1. [ ] Footer renders with `linear-gradient(135deg, #192950, #21497B)` background
2. [ ] Footer has 3px solid top border in `#4E9A3B` (--color-green-accent-text)
3. [ ] Grid layout: 2fr 1fr 1fr on desktop (≥1024px), 2 columns (480-1023px), 1 column (≤480px)
4. [ ] Social links render as 40×40px circles with green accent on hover
5. [ ] Divider between main grid and bottom section
6. [ ] Copyright text in `rgba(255,255,255,0.65)` (--text-xs equivalent)

### Task F2.4: Update Footer.tsx — add social icons section, legal links, divider
**Phase**: F2
**Files**:
- modify: client-site/src/components/layout/Footer.tsx
**Changes**:
- Add social icons section after the grid: WhatsApp, LinkedIn, GitHub, email
- Each social link: 40×40px circle with inline SVG icon
- Add horizontal divider between grid and bottom
- Add legal links row in bottom: Privacy, Terms
- Keep existing brand name, description, link lists
**Acceptance Criteria**:
1. [ ] Social icons section renders with 4 links: WhatsApp, LinkedIn, GitHub, email
2. [ ] Each icon is an inline SVG inside a circular link
3. [ ] Divider element exists between grid and bottom section
4. [ ] Bottom section has copyright + legal links side by side (desktop), stacked (mobile)

### Task F2.5: Update Layout.module.css — add padding-top for fixed header
**Phase**: F2
**Files**:
- modify: client-site/src/components/layout/Layout.module.css
**Changes**:
- `.main`: add `padding-top` equal to header height (80px desktop, 56px mobile)
- Responsive padding-top at breakpoints matching header heights
**Acceptance Criteria**:
1. [ ] `.main` has `padding-top` compensating for fixed header height
2. [ ] Content not hidden behind fixed header at any breakpoint
3. [ ] Responsive padding matches header height changes

### Task F2.6: Update client-site globals.css — body background, link colors, container
**Phase**: F2
**Files**:
- modify: client-site/src/styles/globals.css
**Changes**:
- Update `body` link colors: `a { color: var(--color-blue-ui) }`, hover `var(--color-blue-medium)`
- Keep existing body bg as white (--color-neutral-0)
- Add fadeIn animation keyframes
- Keep existing touch target rules (min-height: 44px)
**Acceptance Criteria**:
1. [ ] Link colors use `--color-blue-ui` for default, darker blue for hover
2. [ ] fadeIn keyframe animation added
3. [ ] Existing styles preserved

### Task F2.7: TypeScript check — ensure 0 errors after F2 changes
**Phase**: F2
**Files**:
- run: `pnpm -r run typecheck` from project root
**Acceptance Criteria**:
1. [ ] `pnpm -r run typecheck` exits with code 0
2. [ ] All CSS Module imports resolve correctly
3. [ ] No TypeScript errors in client-site

---

## Phase F3: Client Components — Button, Card, Badge

> **Goal**: Update shared Button and Card components to V1 styling, create shared Badge component. Update all client-site card components to use green left border pattern.
> **Commit**: `feat(shared): update Button and Card to V1 brand, add Badge`

### Task F3.1: Update Button.module.css — add V1 variants (whatsapp, large, full) and V1 colors
**Phase**: F3
**Files**:
- modify: packages/shared/src/components/ui/Button/Button.module.css
**Changes**:
- Update `.primary`: `background: var(--color-blue-ui)`, hover `var(--color-green-accent-text)` + `translateY(-2px)` + `box-shadow: var(--shadow-md)`
- Update `.secondary`: `background: transparent`, `color: var(--color-blue-ui)`, `border: 1px solid var(--color-blue-ui)`, hover fills with blue-ui
- Add `.whatsapp`: `background: #128C7E`, hover `#0E7A6E` + green shadow
- Add `.large`: `padding: var(--spacing-md) var(--spacing-2xl)`, `font-size: var(--font-size-lg)`
- Add `.full`: `width: 100%`, `justify-content: center`
- All buttons: `min-height: 44px`, `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Hover effects wrapped in `@media (hover: hover)`
**Acceptance Criteria**:
1. [ ] `.primary` uses `--color-blue-ui` background, hover to `--color-green-accent-text` with `-2px` lift
2. [ ] `.whatsapp` variant exists with `#128C7E` background and green shadow on hover
3. [ ] `.large` size variant has larger padding and font-size
4. [ ] `.full` width variant centers content
5. [ ] All buttons have `min-height: 44px`
6. [ ] Transition uses `0.3s cubic-bezier(0.4, 0, 0.2, 1)`
7. [ ] Hover effects wrapped in `@media (hover: hover)`

### Task F3.2: Update Button.tsx — add 'whatsapp' to ButtonVariant type
**Phase**: F3
**Files**:
- modify: packages/shared/src/components/ui/Button/Button.tsx
**Changes**:
- Add `'whatsapp'` to `ButtonVariant` type: `export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'whatsapp';`
- Add `'large'` to `ButtonSize` type: `export type ButtonSize = 'sm' | 'md' | 'lg' | 'large';`
- No logic changes needed — variant and size are already used as CSS class names
**Acceptance Criteria**:
1. [ ] `ButtonVariant` includes `'whatsapp'`
2. [ ] `ButtonSize` includes `'large'`
3. [ ] No TypeScript errors

### Task F3.3: Rewrite Card.module.css — green left border, hover elevation, white bg
**Phase**: F3
**Files**:
- rewrite: packages/shared/src/components/ui/Card/Card.module.css
**Changes**:
- `.card`: `background: white`, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-md)`, `border: none`, `border-left: 3px solid var(--color-green-backend)`, `overflow: hidden`
- `.card:hover`: `transform: translateY(-4px)`, `box-shadow: var(--shadow-lg)`
- `.header`: `padding: var(--spacing-lg)`, `border-bottom: 1px solid var(--color-secondary-200)`
- `.body`: `padding: var(--spacing-lg)`, `color: var(--color-secondary-600)`
- `.footer`: `padding: var(--spacing-md) var(--spacing-lg)`, `border-top: 1px solid var(--color-secondary-200)`
- `.badge`: `text-transform: uppercase`, `font-size: 0.65rem`, `color: var(--color-green-backend)`, `background: rgba(62,152,93,0.1)`, `padding: var(--spacing-xs) var(--spacing-sm)`, `border-radius: var(--radius-sm)`
- Hover effects wrapped in `@media (hover: hover)`
**Acceptance Criteria**:
1. [ ] Card has no full border, only `border-left: 3px solid var(--color-green-backend)`
2. [ ] Card has `border-radius: var(--radius-lg)` (1rem)
3. [ ] Card hover elevates: `translateY(-4px)` + `box-shadow: var(--shadow-lg)`
4. [ ] Badge styling matches: uppercase, 0.65rem, #3E985D with 10% opacity background

### Task F3.4: Update Card.tsx — add badge and image optional props
**Phase**: F3
**Files**:
- modify: packages/shared/src/components/ui/Card/Card.tsx
**Changes**:
- Add optional `badge?: string` prop (renders badge span)
- Add optional `image?: string` prop (renders 200px image at top)
- Reuse existing header/children/footer slots
**Acceptance Criteria**:
1. [ ] Card accepts optional `badge` string prop — renders `.badge` element
2. [ ] Card accepts optional `image` string prop — renders image with 200px height
3. [ ] Existing header/children/footer slots work unchanged

### Task F3.5: Create Badge shared component
**Phase**: F3
**Files**:
- create: packages/shared/src/components/ui/Badge/Badge.tsx
- create: packages/shared/src/components/ui/Badge/Badge.module.css
- create: packages/shared/src/components/ui/Badge/index.ts
**Component Props**:
```typescript
export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'developing' | 'available' | 'coming';
  className?: string;
}
```
**CSS**:
- `.badge`: `text-transform: uppercase`, `font-size: 0.65rem`, `font-weight: 600`, `letter-spacing: 0.75px`, `padding: var(--spacing-xs) var(--spacing-sm)`, `border-radius: var(--radius-sm)`, `display: inline-block`
- `.default`: `color: var(--color-green-backend)`, `background: rgba(62,152,93,0.1)`
- `.developing`: `color: var(--color-blue-ui)`, `background: rgba(37,96,157,0.1)`
- `.available`: same as default
- `.coming`: `color: #f59e0b`, `background: rgba(245,158,11,0.1)`
**Export**: Add Badge to `packages/shared/src/components/index.ts` and `packages/shared/src/index.ts`
**Acceptance Criteria**:
1. [ ] Badge component exists in `@jsoft/shared/src/components/ui/Badge/`
2. [ ] Badge exports from shared package index (both components/index.ts and index.ts)
3. [ ] Badge renders with green accent (default), or variant-specific colors
4. [ ] TypeScript compiles without errors

### Task F3.6: Update client-site card components to use green left border pattern
**Phase**: F3
**Files**:
- modify: client-site/src/components/services/ServiceCard.module.css (add green left border, V1 hover)
- modify: client-site/src/components/products/ProductCard.module.css (add green left border, V1 hover)
- modify: client-site/src/components/tools/ToolCard.module.css (add green left border, V1 hover)
- modify: client-site/src/components/successCases/SuccessCaseCard.module.css (add green left border, V1 hover)
**Changes per card**:
- Remove full border, set `border: none; border-left: 3px solid var(--color-green-backend)`
- Ensure white background
- Update hover: `translateY(-4px)`, `box-shadow: var(--shadow-lg)`
- Align border-radius to `var(--radius-lg)`
**Acceptance Criteria**:
1. [ ] All 4 card components use green left border (`3px solid var(--color-green-backend)`)
2. [ ] All cards have consistent hover elevation (`-4px` + `--shadow-lg`)
3. [ ] All cards have consistent border-radius

### Task F3.7: TypeScript check — ensure 0 errors after F3 changes
**Phase**: F3
**Files**:
- run: `pnpm -r run typecheck` from project root
**Acceptance Criteria**:
1. [ ] `pnpm -r run typecheck` exits with code 0
2. [ ] Badge exports resolve correctly across all packages
3. [ ] Button variant types update consumed correctly

---

## Phase F4: Client Pages — Hero, Page Header, Sections

> **Goal**: Rewrite Home hero (gradient + overlay + badges + CTAs), Services/Contact page headers (gradient), create shared PageHeader component.
> **Commit**: `feat(client): apply V1 brand to page sections`

### Task F4.1: Rewrite Home Hero — gradient background, overlay, badges, CTAs
**Phase**: F4
**Files**:
- rewrite: client-site/src/pages/Home/Hero.module.css
- modify: client-site/src/pages/Home/Hero.tsx
**Changes**:
- `.hero-section`: `min-height: 80vh`, `display: flex`, `align-items: center`, gradient background, `position: relative`, `overflow: hidden`
- `.hero-overlay`: absolute position, `background: linear-gradient(135deg, rgba(25,41,80,0.85), rgba(33,73,123,0.75))`, `pointer-events: none`
- `.hero-badges`: flex wrap, center, gap, badges with `backdrop-filter: blur`, white text, pill shape
- `.hero-content h1`: white, green-accent (`#7CBD68`) for `.text-highlight` spans
- `.hero-ctas`: flex row, primary CTA (blue-ui) + WhatsApp button (green-accent)
- Hero.tsx: add overlay div, badges, highlight spans
**Acceptance Criteria**:
1. [ ] Hero section has gradient background `135deg #192950 → #21497B`
2. [ ] Overlay present with `rgba(25,41,80,0.85)`
3. [ ] `min-height: 80vh` on desktop
4. [ ] Badges render with `backdrop-filter: blur`, white text, pill shape (`--radius-full`)
5. [ ] Title has green-accent (`#7CBD68`) highlighted spans
6. [ ] CTA buttons: primary (blue-ui) + WhatsApp (#128C7E) variants

### Task F4.2: Add Home sections — packages grid, niches pills, why cards, CTA section
**Phase**: F4
**Files**:
- modify: client-site/src/pages/Home/index.tsx (add new sections)
- modify: client-site/src/pages/Home/FeaturedServices.module.css (update section styles)
- modify: client-site/src/pages/Home/CTA.module.css (update to gradient bg)
**Changes**:
- Packages grid: white cards with green left border, grid layout, shadow
- Niches pills: pill-shaped tags, blue-ui bg on hover
- Why cards: white, shadow, hover elevation
- CTA section: gradient background matching brand, white text
**Acceptance Criteria**:
1. [ ] Section headers centered with `--color-blue-base` titles and gray-600 subtitles
2. [ ] Packages section uses gray-50 background
3. [ ] CTA section uses gradient background
4. [ ] All section padding uses `--spacing-3xl` vertical

### Task F4.3: Rewrite Services page header — gradient background
**Phase**: F4
**Files**:
- rewrite: client-site/src/pages/Services/Services.module.css (add gradient page header)
- modify: client-site/src/pages/Services/index.tsx (wrap header in gradient section)
**Changes**:
- Page header: `background: linear-gradient(135deg, var(--color-blue-base), var(--color-blue-medium))`, `text-align: center`, `padding: var(--spacing-3xl) var(--spacing-md)`
- Title: white, bold
- Subtitle: `rgba(255,255,255,0.9)`, `max-width: 600px`
**Acceptance Criteria**:
1. [ ] Services page header has gradient background (135deg blue-base → blue-medium)
2. [ ] Title text is white
3. [ ] Subtitle is `rgba(255,255,255,0.9)` with max-width 600px

### Task F4.4: Rewrite Contact page hero — gradient background
**Phase**: F4
**Files**:
- rewrite: client-site/src/pages/Contact/Contact.module.css (add gradient page header)
- modify: client-site/src/pages/Contact/index.tsx (wrap header in gradient section)
**Changes**:
- Contact hero: gradient background, white title, subtitle
- Contact cards: white bg, shadow, green left border
- WhatsApp card: green (#128C7E) background
**Acceptance Criteria**:
1. [ ] Contact page has gradient header section
2. [ ] Contact info cards have V1 styling

### Task F4.5: Create shared PageHeader component
**Phase**: F4
**Files**:
- create: client-site/src/components/common/PageHeader/PageHeader.tsx
- create: client-site/src/components/common/PageHeader/PageHeader.module.css
- create: client-site/src/components/common/PageHeader/index.ts
**Props**:
```typescript
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}
```
**CSS**:
- `.header`: `background: linear-gradient(135deg, var(--color-blue-base), var(--color-blue-medium))`, `text-align: center`, `padding: var(--spacing-3xl) var(--spacing-md)`
- `.title`: white, bold, responsive font-size
- `.subtitle`: `rgba(255,255,255,0.9)`, `max-width: 600px`, centered
**Usage**: Replace inline gradient headers in Services and Contact pages
**Acceptance Criteria**:
1. [ ] PageHeader component renders gradient background
2. [ ] Component accepts title and optional subtitle
3. [ ] Used in Services and Contact pages replacing inline headers

### Task F4.6: Apply consistent section patterns to service detail, product, tool pages
**Phase**: F4
**Files**:
- read: client-site/src/pages/Services/ServiceDetail.tsx (check existing header)
- read: client-site/src/pages/Services/ServiceDetail.module.css (update if needed)
**Changes**:
- Apply PageHeader component to service detail pages
- Ensure cards within detail pages use shared Card or have green left border
**Acceptance Criteria**:
1. [ ] Service detail page uses PageHeader or has gradient header
2. [ ] Cards within sections use green-left-border pattern

### Task F4.7: TypeScript check — ensure 0 errors after F4 changes
**Phase**: F4
**Files**:
- run: `pnpm -r run typecheck` from project root
**Acceptance Criteria**:
1. [ ] `pnpm -r run typecheck` exits with code 0

---

## Phase F5: Recruiter Site — Apply V1 Brand

> **Goal**: Apply same layout/component patterns from F2+F3 to recruiter-site: Header (gradient, fixed, green border), Footer (gradient, grid, social icons), and shared components.
> **Commit**: `feat(recruiter): apply V1 brand to layout components`

### Task F5.1: Rewrite Recruiter Header.module.css — matching client-site pattern
**Phase**: F5
**Files**:
- rewrite: recruiter-site/src/components/layout/Header.module.css
**Changes**: Same as F2.1 — gradient bg, fixed position, green border-bottom, nav underline, hamburger, mobile overlay
**Acceptance Criteria**:
1. [ ] Header has gradient background `135deg #192950 → #21497B`
2. [ ] Header is fixed with green bottom border (3px, `--color-green-accent`)
3. [ ] Nav links have green underline animation
4. [ ] Hamburger toggle works at ≤768px with full-screen overlay

### Task F5.2: Update Recruiter Header.tsx — add scroll-hide/show behavior
**Phase**: F5
**Files**:
- modify: recruiter-site/src/components/layout/Header.tsx
**Changes**:
- Add scroll-hide/show logic (same as client-site: hide on scroll down >100px, show on scroll up)
- Add isHidden state and effect
**Acceptance Criteria**:
1. [ ] Header hides on scroll down past 100px, shows on scroll up
2. [ ] Same scroll behavior as client-site Header

### Task F5.3: Rewrite Recruiter Footer.module.css — matching client-site pattern
**Phase**: F5
**Files**:
- rewrite: recruiter-site/src/components/layout/Footer.module.css
**Changes**: Same as F2.3 — gradient bg, green top border, grid layout, social circles, divider, bottom
**Acceptance Criteria**:
1. [ ] Footer has gradient background with 3px green top border
2. [ ] Grid layout 2fr 1fr 1fr on desktop, responsive
3. [ ] Social links as 40×40px circles with green hover

### Task F5.4: Update Recruiter Footer.tsx — use inline SVG social icons, ensure grid structure
**Phase**: F5
**Files**:
- modify: recruiter-site/src/components/layout/Footer.tsx
**Changes**:
- Replace emoji social icons with inline SVGs
- Add grid layout structure (brand, links, social sections)
- Add legal links (Privacy, Terms)
- Add divider
**Acceptance Criteria**:
1. [ ] Social icons are inline SVGs (not emojis)
2. [ ] Footer has complete grid: brand, links, social
3. [ ] Legal links present in bottom section

### Task F5.5: Update Recruiter Layout — padding-top for fixed header
**Phase**: F5
**Files**:
- modify: recruiter-site/src/components/layout/Layout.module.css
**Changes**: Add `padding-top` on `.main` for fixed header height
**Acceptance Criteria**:
1. [ ] Content not hidden behind fixed header
2. [ ] Responsive padding matches header height

### Task F5.6: Update recruiter globals.css / index.css — body bg, link colors
**Phase**: F5
**Files**:
- modify: recruiter-site/src/index.css
**Changes**:
- Update link colors to V1 blue-ui
- Add fadeIn/slideUp animation keyframes
- Add `prefers-reduced-motion` override
**Acceptance Criteria**:
1. [ ] Link colors use V1 brand tokens
2. [ ] Animation keyframes added

### Task F5.7: Apply shared Card/Button/Badge components to recruiter pages
**Phase**: F5
**Files**:
- modify: recruiter-site/src/pages/ProjectsPage.tsx (if using cards)
- modify: recruiter-site/src/pages/BlogPage.tsx (if using cards)
- modify: recruiter-site/src/pages/ContactPage.tsx (if using buttons)
**Changes**: Use shared Button, Card, Badge from `@jsoft/shared` where applicable
**Acceptance Criteria**:
1. [ ] Cards in recruiter pages use shared Card or have green left border
2. [ ] Buttons use shared Button component with V1 variants

### Task F5.8: TypeScript check — ensure 0 errors after F5 changes
**Phase**: F5
**Files**:
- run: `pnpm -r run typecheck` from project root
**Acceptance Criteria**:
1. [ ] `pnpm -r run typecheck` exits with code 0

---

## Phase F6: Admin Panel — Apply V1 Brand Colors

> **Goal**: Apply V1 brand colors to admin-panel CSS Modules created in F0: gradient header, blue sidebar, green active states.
> **Commit**: `feat(admin): apply V1 brand colors via CSS Modules`

### Task F6.1: Apply brand gradient to admin Header, add green bottom border
**Phase**: F6
**Files**:
- modify: admin-panel/src/components/layout/Header.module.css
**Changes**:
- `.header`: `background: linear-gradient(135deg, var(--color-blue-base), var(--color-blue-medium))`, `border-bottom: 3px solid var(--color-green-accent)`
- Adjust text colors for readability on dark background
- Keep existing layout dimensions
**Acceptance Criteria**:
1. [ ] Admin header has gradient background matching brand
2. [ ] Header has green bottom border (3px, `--color-green-accent`)
3. [ ] Text/buttons on header are white or light colored for contrast

### Task F6.2: Apply blue-base to admin Sidebar, green accent for active items
**Phase**: F6
**Files**:
- modify: admin-panel/src/components/layout/Sidebar.module.css
**Changes**:
- `.sidebar`: `background: var(--color-blue-base)` (replaces `#1a1a2e`)
- `.navLink.active`: `color: var(--color-green-accent)`, `background: rgba(122, 203, 104, 0.1)`
- Adjust collapsed state styling
**Acceptance Criteria**:
1. [ ] Sidebar background is `--color-blue-base` (`#192950`)
2. [ ] Active nav items use green accent (`--color-green-accent: #7CBD68`)
3. [ ] Collapse/expand toggle works correctly

### Task F6.3: Update admin Layout with consistent spacing and brand colors
**Phase**: F6
**Files**:
- modify: admin-panel/src/components/layout/DashboardLayout.module.css
**Changes**:
- `.main`: update `background` to `var(--color-secondary-50)` (light gray)
- Use shared spacing tokens for consistency
**Acceptance Criteria**:
1. [ ] Main content area has consistent background using brand tokens
2. [ ] Spacing uses shared token values

### Task F6.4: Apply shared Button to admin forms/actions
**Phase**: F6
**Files**:
- modify: admin-panel/src/components/layout/Header.tsx (use shared Button for logout)
- explore: admin-panel/src/pages/ (find all buttons to update)
**Changes**:
- Replace inline-styled logout button with shared `<Button variant="danger">`
- Use shared Button in any visible admin form actions
**Acceptance Criteria**:
1. [ ] Admin logout button uses shared Button component
2. [ ] Admin form buttons use shared Button

### Task F6.5: Update admin globals.css — import shared variables, brand colors
**Phase**: F6
**Files**:
- modify: admin-panel/src/index.css
**Changes**:
- Ensure `@import '@jsoft/shared/styles/variables.css'` is present
- Update body defaults to use brand variables
- Update tiptap editor colors to match brand
**Acceptance Criteria**:
1. [ ] admin-panel/index.css imports shared variables
2. [ ] Editor and admin-specific components use V1 brand colors where applicable

### Task F6.6: TypeScript check — ensure 0 errors after F6 changes
**Phase**: F6
**Files**:
- run: `pnpm -r run typecheck` from project root
**Acceptance Criteria**:
1. [ ] `pnpm -r run typecheck` exits with code 0

---

## Phase F7: Polish & Animations

> **Goal**: Add fade-in/slide-up animations, prefers-reduced-motion, responsive verification, WCAG AA contrast check, cross-frontend consistency.
> **Commit**: `feat: add animations, reduced motion, responsive polish`

### Task F7.1: Add fadeIn keyframe animation to page content (all 3 frontends)
**Phase**: F7
**Files**:
- modify: client-site/src/styles/globals.css (add fadeIn + apply to main content)
- modify: recruiter-site/src/index.css (add fadeIn + apply to main content)
**Changes**:
- `@keyframes fadeIn`: `from { opacity: 0; } to { opacity: 1; }`
- `.main-content` or main container: `animation: fadeIn 0.4s ease-out`
- Apply to Layout main content areas
**Acceptance Criteria**:
1. [ ] Page content fades in on load (opacity 0→1 over 0.4s)
2. [ ] Applied consistently in client-site and recruiter-site

### Task F7.2: Add slideUp keyframe animation for card grids entering viewport
**Phase**: F7
**Files**:
- modify: client-site/src/styles/globals.css (add slideUp animation)
- modify: recruiter-site/src/index.css (add slideUp animation)
**Changes**:
- `@keyframes slideUp`: `from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`
- `.card-enter` or grid children: `animation: slideUp 0.4s ease-out`
**Acceptance Criteria**:
1. [ ] Cards slide up while fading in on scroll into view
2. [ ] Animation is subtle (20px translate, 0.4s)

### Task F7.3: Add shimmer animation for loading skeletons
**Phase**: F7
**Files**:
- modify: client-site/src/styles/globals.css (add shimmer keyframes)
- modify: packages/shared/src/components/ui/Card/Card.module.css (add .is-loading state)
**Changes**:
- `@keyframes shimmer`: `0% { transform: translateX(-100%); } 100% { transform: translateX(100%); }`
- `.is-loading` pseudo-element: gradient overlay with shimmer animation
**Acceptance Criteria**:
1. [ ] Shimmer animation defined (2s infinite, diagonal gradient)
2. [ ] Loading state available for cards

### Task F7.4: Add prefers-reduced-motion disable for all animations
**Phase**: F7
**Files**:
- modify: client-site/src/styles/globals.css (add reduced-motion override)
- modify: recruiter-site/src/index.css (add reduced-motion override)
- modify: admin-panel/src/index.css (add reduced-motion override)
- modify: packages/shared/src/styles/variables.css (token-level reduced-motion)
**Changes**:
- `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }`
- Also override transition tokens to 0s
**Acceptance Criteria**:
1. [ ] All animations disabled when user prefers reduced motion
2. [ ] Header scroll-hide/show also disabled (no transform transition)
3. [ ] All 3 frontends have the override
4. [ ] Variables.css also sets transition tokens to 0s under reduced motion

### Task F7.5: Verify responsive at 3 breakpoints (375px, 768px, 1440px)
**Phase**: F7
**Files**:
- review: all modified CSS files
**Checks**:
- [ ] 375px: no overflow, no broken layout, hamburger visible, single-column footer
- [ ] 768px: tablet layout correct, hamburger→nav transition, 2-column footer
- [ ] 1440px: full layout, full nav, 3-column footer, proper max-width
- [ ] No horizontal scrollbars at any breakpoint
- [ ] All interactive elements visible and tappable
**Acceptance Criteria**:
1. [ ] All 3 frontends render correctly at 375px
2. [ ] All 3 frontends render correctly at 768px
3. [ ] All 3 frontends render correctly at 1440px

### Task F7.6: Verify touch targets ≥44px on all interactive elements
**Phase**: F7
**Files**:
- review: all modified CSS files
**Checks**:
- [ ] All buttons have `min-height: 44px` (already in globals.css)
- [ ] Icon-only buttons have `min-width: 44px` and `min-height: 44px`
- [ ] Nav links have adequate tap targets on mobile
- [ ] Social icon links are at least 40×40px
**Acceptance Criteria**:
1. [ ] No interactive element smaller than 44×44px touch target
2. [ ] Social icons meet 40px minimum dimension

### Task F7.7: Verify @media (hover: hover) wrapping on hover effects
**Phase**: F7
**Files**:
- review: all modified CSS files
**Checks**:
- [ ] Card `:hover` effects wrapped in `@media (hover: hover)`
- [ ] Button `:hover` effects wrapped in `@media (hover: hover)`
- [ ] Header nav link `:hover` effects wrapped
- [ ] Social icon hover effects wrapped
- [ ] All new hover additions use `@media (hover: hover)`
**Acceptance Criteria**:
1. [ ] All hover effects across all 3 frontends wrapped in `@media (hover: hover)`

### Task F7.8: Verify contrast ratios — WCAG AA compliance
**Phase**: F7
**Files**:
- review: all modified CSS files for color combinations
**Checks**:
- [ ] Text on gradient backgrounds (white text on #192950 → #21497B): ratio ≥ 4.5:1
- [ ] Text on green badges (#2D7A4A on rgba(62,152,93,0.1)): ratio ≥ 4.5:1
- [ ] Link colors (#25609D on white background): ratio ≥ 4.5:1
- [ ] Nav link text (white on gradient): passes
- [ ] Footer link text (rgba white 0.8 on gradient): verify
**Acceptance Criteria**:
1. [ ] All text/background combinations pass WCAG AA (≥4.5:1 normal text, ≥3:1 large text)
2. [ ] Fix any failing combinations

### Task F7.9: TypeScript check — ensure 0 errors after F7 changes
**Phase**: F7
**Files**:
- run: `pnpm -r run typecheck` from project root
**Acceptance Criteria**:
1. [ ] `pnpm -r run typecheck` exits with code 0

---

## Summary

| Phase | Focus | Files | Tasks |
|-------|-------|-------|-------|
| F0 | Admin CSS Modules | 6 files | 5 tasks |
| F1 | Shared Tokens | 1 file | 8 tasks |
| F2 | Client Layout | 6 files | 7 tasks |
| F3 | Client Components | 12-14 files | 7 tasks |
| F4 | Client Pages | 6-8 files | 7 tasks |
| F5 | Recruiter Site | 8-10 files | 8 tasks |
| F6 | Admin Panel | 4-5 files | 6 tasks |
| F7 | Polish & Animations | 6-8 files | 9 tasks |
| **Total** | | **~49-58 files** | **~57 tasks** |

### Verification Gates Per Phase
```
F0 → `pnpm -r run typecheck` + manual visual check of admin layout
F1 → `pnpm -r run typecheck` + confirm tokens in CSS
F2 → `pnpm -r run typecheck` + visual check of header/footer at 3 breakpoints
F3 → `pnpm -r run typecheck` + visual check of cards/buttons/badges
F4 → `pnpm -r run typecheck` + visual check of pages at 3 breakpoints
F5 → `pnpm -r run typecheck` + visual check of recruiter at 3 breakpoints
F6 → `pnpm -r run typecheck` + visual check of admin panel
F7 → `pnpm -r run typecheck` + full visual audit + `pnpm build`
```
