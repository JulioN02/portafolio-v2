# Design: Redesign Visual V1

## Overview

Adapt the V1 brand visual identity (deep blue gradients, green accents, card patterns, rich shadows) to the V2 architecture — replacing generic Tailwind-inspired colors with the J Soft Solutions professional brand. Pure presentation-layer change: no new features, no API changes, no routing changes. CSS Modules maintained throughout; no new npm packages.

---

## 1. Architecture Overview

### Component Tree (client-site)

```
Layout
├── Header (gradient fixed, 3px green bottom border)
│   ├── Logo (58px desktop / 42px mobile)
│   ├── Nav Desktop (≥769px: inline flex, green underline animation)
│   ├── Hamburger (≤768px: animated X, 48x48)
│   └── Nav Mobile (≤768px: overlay fixed, gradient bg, full-screen)
├── Main Content
│   └── Outlet → Page sections
│       ├── Hero (gradient + overlay + badges + CTAs)
│       ├── Section Header (gradient page headers)
│       └── Cards (green left border, shadow, hover elevation)
└── Footer (gradient, 3px green top border)
    ├── Grid: 2fr 1fr 1fr (desktop) → 2 cols → 1 col
    ├── Brand (logo + description)
    ├── Links (title + link list)
    ├── Social (40px circular icons, green accent on hover)
    ├── Divider (rgba white 0.1)
    └── Bottom (copyright + legal links)
```

### Shared Component Strategy

| Component | Location | Rationale |
|-----------|----------|-----------|
| Button | `@jsoft/shared/src/components/ui/Button/` | Already exists; add `whatsapp` variant + V1 colors |
| Card | `@jsoft/shared/src/components/ui/Card/` | Already exists; update CSS module to V1 green-left-border styling |
| Badge | `@jsoft/shared/src/components/ui/Badge/` (new) | Used across all 3 frontends; green accent, uppercase |
| Header | Per-frontend `components/layout/` | Nav links differ between sites; header structure same pattern |
| Footer | Per-frontend `components/layout/` | Social links and legal text differ per site |

---

## 2. Token Architecture (Dual Strategy)

### Principle
Existing scale tokens (`--color-primary-50→900`, `--color-secondary-50→900`) remain **untouched**. New V1 semantic tokens are added **alongside** them in `packages/shared/src/styles/variables.css`. Existing code that references scale tokens continues working. Components migrate one by one to V1 tokens.

### New Tokens to Add

```css
:root {
  /* ── V1 Brand Colors (Semantic) ── */
  --color-blue-base: #192950;
  --color-blue-medium: #21497B;
  --color-blue-ui: #25609D;
  --color-blue-light: #e0eaf5;

  --color-green-backend: #3E985D;
  --color-green-accent: #7CBD68;
  --color-green-accent-text: #4E9A3B;
  --color-green-backend-text: #2D7A4A;

  /* ── V1 Shadows (softer, deeper) ── */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);        /* unchanged */
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);          /* updated from rgb alpha */
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);          /* updated */
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);          /* NEW */

  /* ── V1 Transitions ── */
  --transition-fast: 0.15s ease-in-out;               /* unchanged */
  --transition-base: 0.2s ease-in-out;                /* NEW (was --transition-normal) */
  --transition-slow: 0.3s ease-in-out;                /* renamed from --transition-slow */
  --transition-slower: 0.5s ease-in-out;              /* NEW */

  /* ── V1 Easing ── */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* ── V1 Spacing (add missing) ── */
  /* existing: xs(0.25), sm(0.5), md(1), lg(1.5), xl(2) — keep */
  --spacing-2xl: 3rem;                                /* NEW */
  --spacing-3xl: 4rem;                                /* NEW */

  /* ── V1 Radius (add missing) ── */
  --radius-none: 0;                                   /* NEW */
  /* existing: sm(0.25), md(0.375), lg(0.5), xl(0.75), full(9999px) — keep */
}
```

**Important**: Shadow values change from `rgb(0 0 0 / 0.05)` syntax to `rgba(0,0,0,0.05)` syntax for consistency with V1. This is a **breaking change** for any code relying on the exact syntax — verify no consumer parses shadow strings.

### `prefers-reduced-motion` Override
```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 0s;
    --transition-base: 0s;
    --transition-slow: 0s;
    --transition-slower: 0s;
  }
}
```

---

## 3. Component Specifications

### 3.1 Header Component

**Files**: `client-site/src/components/layout/Header.tsx` (modified), `Header.module.css` (rewrite)

**HTML Structure**:
```tsx
<header className={styles.header + (isHidden ? ' ' + styles.hidden : '')}>
  <div className={styles.container}>
    <Link to="/" className={styles.logo}>
      <img src="/logo.svg" alt="J Soft Solutions" className={styles.logoImg} />
    </Link>
    <nav className={styles.navDesktop}>
      <NavLink className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`} />
    </nav>
    <button className={styles.hamburger} aria-label="Toggle menu" aria-expanded={isMenuOpen}>
      <span /><span /><span />
    </button>
    <nav className={`${styles.navMobile} ${isMenuOpen ? styles.open : ''}`}>
      <NavLink className={/*...*/} onClick={() => setIsMenuOpen(false)} />
    </nav>
  </div>
</header>
```

**CSS Module Key Classes**:

| Class | Properties |
|-------|-----------|
| `.header` | `position: fixed; top: 0; z-index: 1000; background: linear-gradient(135deg, var(--color-blue-base), var(--color-blue-medium)); border-bottom: 3px solid var(--color-green-accent); transition: transform 420ms cubic-bezier(0.16,1,0.3,1);` |
| `.hidden` | `transform: translateY(-100%);` |
| `.container` | `height: 80px; max-width: 1200px; margin: auto; padding: 0 var(--spacing-md);` |
| `.logoImg` | `height: 58px; width: auto;` |
| `.navLink` | `position: relative; padding: 0.5rem 1rem; color: white; ::after` underline animation |
| `.navLink.active` | `color: var(--color-green-accent-text);` |
| `.navLink::after` | Center-expanding underline: `left: 50%; width: 0 → 100%; height: 2px; background: var(--color-green-accent);` |
| `.hamburger` | `display: none;` (≥769px). `48x48; background: rgba(255,255,255,0.1); border-radius: 12px;` |
| `.navMobile` | Overlay: `position: fixed; top: 64px; left/right/bottom: 0; background: linear-gradient(180deg, var(--color-blue-base), var(--color-blue-medium));` |

**JS Changes** (in `Header.tsx`):
- Scroll-hide/show logic already exists (`isHidden` state based on scroll direction + 100px threshold) — **keep as-is**
- Hamburger toggle already exists — **keep as-is**
- Change header from `position: sticky` to `position: fixed` (SR-2.1)
- Add `will-change: transform` for GPU-accelerated animation

**Responsive**:

| Breakpoint | Height | Logo | Nav |
|-----------|--------|------|-----|
| ≤480px | 56px | 42px (no text) | Hamburger |
| 481–768px | 64px | 42px | Hamburger |
| 769–1024px | 70px | 58px | Full nav, smaller links |
| ≥1025px | 80px | 58px | Full nav |

**States**: default, hidden (scroll-down), scrolled (enhanced shadow), hover (nav link), focus-visible (keyboard outline), active (NavLink), open (mobile nav overlay).

### 3.2 Footer Component

**Files**: `client-site/src/components/layout/Footer.tsx` (modified), `Footer.module.css` (rewrite)

**CSS Module Key Classes**:

| Class | Properties |
|-------|-----------|
| `.footer` | `background: linear-gradient(135deg, var(--color-blue-base), var(--color-blue-medium)); border-top: 3px solid var(--color-green-accent-text); padding: var(--spacing-2xl) var(--spacing-md);` |
| `.grid` | `display: grid; grid-template-columns: 2fr 1fr 1fr; gap: var(--spacing-xl);` |
| `.socialLink` | `width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;` |
| `.socialLink:hover` | `background: var(--color-green-accent); transform: translateY(-2px);` |
| `.divider` | `height: 1px; background: rgba(255,255,255,0.1); margin: var(--spacing-lg) 0;` |
| `.bottom` | `display: flex; justify-content: space-between; font-size: var(--text-xs); color: rgba(255,255,255,0.65);` |

**Grid Responsive**:

| Breakpoint | Columns |
|-----------|---------|
| ≤480px | 1fr (stack) |
| 481–768px | 2 columns |
| 769–1023px | 2 columns |
| ≥1024px | 2fr 1fr 1fr |

**TSX Changes**: Add social icons section (WhatsApp, LinkedIn, GitHub, email) as circular icon links. Add divider between grid and bottom. Add legal links (Privacy, Terms).

### 3.3 Card Component

**File**: `packages/shared/src/components/ui/Card/Card.module.css` (rewrite)

| Class | Properties |
|-------|-----------|
| `.card` | `background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-md); border: none; border-left: 3px solid var(--color-green-backend);` |
| `.card:hover` | `transform: translateY(-4px); box-shadow: var(--shadow-lg);` |
| `.header` | `padding: var(--spacing-lg); border-bottom: 1px solid var(--color-secondary-200);` |
| `.body` | `padding: var(--spacing-lg); color: var(--color-secondary-600);` |
| `.footer` | `padding: var(--spacing-md) var(--spacing-lg); border-top: 1px solid var(--color-secondary-200);` |
| `.badge` | `text-transform: uppercase; font-size: 0.65rem; color: var(--color-green-backend); background: rgba(62,152,93,0.1); padding: var(--spacing-xs) var(--spacing-sm); border-radius: var(--radius-sm);` |

**TSX Changes**: Add optional `badge` prop to Card. Add `image` prop (optional, 200px height, `object-fit: cover`).

### 3.4 Button Component

**File**: `packages/shared/src/components/ui/Button/Button.module.css` (modify)

Add new variant classes alongside existing ones:

| Variant | Default | Hover |
|---------|---------|-------|
| `.primary` (updated) | `background: var(--color-blue-ui); color: white;` | `background: var(--color-green-accent-text); color: var(--color-blue-base); transform: translateY(-2px); box-shadow: var(--shadow-md);` |
| `.secondary` | `background: transparent; color: var(--color-blue-ui); border: 1px solid var(--color-blue-ui);` | `background: var(--color-blue-ui); color: white;` |
| `.whatsapp` (NEW) | `background: #128C7E; color: white;` | `background: #0E7A6E; box-shadow: 0 10px 20px -5px rgba(18,140,126,0.4);` |
| `.large` (NEW) | `padding: var(--spacing-md) var(--spacing-2xl); font-size: var(--font-size-lg);` |
| `.full` (NEW) | `width: 100%; justify-content: center;` |

All buttons: `min-height: 44px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);`

**Hover effects** wrapped in `@media (hover: hover)`.

### 3.5 Page Section Patterns

#### Hero Section (client-site home)
```
section.hero-section
├── .hero-overlay (absolute, gradient rgba(25,41,80,0.85))
├── .hero-content (z-index: 1, centered)
│   ├── .hero-badges (flex wrap, backdrop-filter blur, pill shape)
│   ├── h1 (white, green-accent highlights)
│   ├── p.hero-description (rgba white 0.9)
│   └── .hero-ctas (flex row wrap)
│       ├── .btn-primary
│       └── .btn-whatsapp
```

**CSS**: `.hero-section { min-height: 80vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }`

#### Page Header (services, contact, etc.)
```
header.page-header
├── h1 (white, bold)
└── p.subtitle (rgba white 0.9, max-width 600px)
```

**CSS**: `.page-header { background: linear-gradient(135deg, var(--color-blue-base), var(--color-blue-medium)); text-align: center; padding: var(--spacing-3xl) var(--spacing-md); }`

### 3.6 Admin Panel (F6 Prerequisite)

**F0—Prerequisite Phase**: Rewrite admin-panel layout components to CSS Modules before applying V1 colors.

| File | Current | Target |
|------|---------|--------|
| `Header.tsx` | Inline styles | CSS Module + `styles.header` gradient bg |
| `Sidebar.tsx` | Inline styles | CSS Module + `styles.sidebar` with `#192950` bg |
| `DashboardLayout.tsx` | Inline styles | CSS Module + `styles.layout` flex container |

**After CSS Modules exist** (F6): Apply V1 brand tokens — sidebar `--color-blue-base`, active nav green accent `--color-green-accent`, header gradient matching public sites.

---

## 4. Architecture Decisions

### Decision 1: Dual Token Strategy
**Choice**: Add V1 semantic tokens alongside existing scale tokens.
**Alternatives**: Replace existing tokens entirely; alias new tokens to old token names.
**Rationale**: Zero breakage risk. Existing code using `--color-primary-500` continues working. Components migrate incrementally per phase. Revertible per-component. Alias approach would couple old and new — any future token change would ripple.

### Decision 2: CSS Modules (no CSS-in-JS)
**Choice**: Maintain existing CSS Modules with CSS custom properties.
**Alternatives**: Switch to Tailwind, styled-components, or vanilla extract.
**Rationale**: CSS Modules are already established across all 3 frontends. Adding a CSS-in-JS runtime would increase bundle size. Tailwind would require rewriting all existing components. CSS custom properties provide the same theming capability at zero cost.

### Decision 3: Shared Base Components + Per-Frontend Layout
**Choice**: Button and Card in `@jsoft/shared`; Header/Footer per frontend.
**Alternatives**: Duplicate all components per frontend; or share Header/Footer via shared package.
**Rationale**: Button and Card are identical across frontends — sharing enforces consistency. Header/Footer have different nav links, social profiles, and content per site — per-frontend is cleaner than prop-drilling the differences.

### Decision 4: `position: fixed` header (not sticky)
**Choice**: Fixed header with scroll-hide/show behavior.
**Alternatives**: Sticky header (current); static header.
**Rationale**: V1 uses fixed header with scroll-hide/show — this is a core UX pattern (SR-2.2). Sticky doesn't support the hide-on-scroll-down animation. Fixed requires `padding-top` compensation on `Layout.main` (`80px` on desktop, `56px` on mobile).

### Decision 5: Social Icons as Inline SVGs (no icon library)
**Choice**: Inline SVG icons for social links.
**Alternatives**: Install react-icons, FontAwesome, or Heroicons.
**Rationale**: Only 4-5 social icons needed (WhatsApp, LinkedIn, GitHub, email). Adding an icon library for this is overkill. Inline SVGs are zero-dependency, fully customizable, and tree-shakeable by nature.

### Decision 6: Badge as shared component
**Choice**: Create `@jsoft/shared/src/components/ui/Badge/`.
**Alternatives**: Inline badge styles per card variant.
**Rationale**: Badge pattern (green accent, uppercase, 0.65rem, 10% opacity bg) is used across all 3 frontends in cards, hero sections, and page headers. A shared component ensures consistent styling and reduces duplication.

---

## 5. Data Flow

No data flow changes. This is a pure CSS change — the React component tree, routing, API calls, and state management remain identical. The only JS changes are:

1. Header scroll-state shadow behavior (already exists, minor enhancement)
2. Footer social icon link markup
3. Card badge/image optional props
4. Admin-panel inline styles → CSS Module imports

### Component Props (New/Modified)

```typescript
// Button — new variant
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'whatsapp';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'large';

// Card — new optional props
export interface CardProps {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  badge?: string;       // NEW: badge text
  image?: string;       // NEW: image URL
  className?: string;
}

// Badge — new component
export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'developing' | 'available' | 'coming';
  className?: string;
}
```

---

## 6. Animation Plan

### Fade-in (page content)
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Applied to main content wrapper */
.main-content {
  animation: fadeIn 0.4s ease-out;
}
```

### Slide-up (cards entering viewport)
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-enter {
  animation: slideUp 0.4s ease-out;
}
```

### Shimmer (loading skeleton)
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.card.is-loading::after {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite;
}
```

### Nav Underline (Header)
```css
.site-header__link::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 0;
  height: 2px;
  background: var(--color-green-accent);
  transform: translateX(-50%);
  transition: width var(--transition-fast) ease-out;
}

.site-header__link:hover::after,
.site-header__link.active::after {
  width: 100%;
}
```

### Reduced Motion
All animations wrapped in:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Migration Order (Per Phase)

### F0: Prerequisite — Admin Panel CSS Modules
| File | Action |
|------|--------|
| `admin-panel/src/components/layout/Header.tsx` | Rewrite — extract inline styles to CSS Module |
| `admin-panel/src/components/layout/Header.module.css` | Create |
| `admin-panel/src/components/layout/Sidebar.tsx` | Rewrite — extract inline styles to CSS Module |
| `admin-panel/src/components/layout/Sidebar.module.css` | Create |
| `admin-panel/src/components/layout/DashboardLayout.tsx` | Rewrite — extract inline styles to CSS Module |
| `admin-panel/src/components/layout/DashboardLayout.module.css` | Create |
| **Commit**: `feat(admin): extract layout components to CSS Modules` |

### F1: Shared Tokens
| File | Action |
|------|--------|
| `packages/shared/src/styles/variables.css` | Add V1 brand colors, shadows, transitions, spacing, radius, easing tokens |
| **Commit**: `feat(shared): add V1 brand design tokens` |

### F2: Client Layout
| File | Action |
|------|--------|
| `client-site/src/components/layout/Header.tsx` | Change `sticky` → `fixed`, add scroll shadow class |
| `client-site/src/components/layout/Header.module.css` | Rewrite — gradient bg, green border, fixed, nav underline, mobile overlay |
| `client-site/src/components/layout/Footer.tsx` | Add social icons section, legal links, divider |
| `client-site/src/components/layout/Footer.module.css` | Rewrite — gradient bg, green top border, grid, social circles |
| `client-site/src/components/layout/Layout.module.css` | Add `padding-top` for fixed header height |
| `client-site/src/styles/globals.css` | Update link colors to V1 blue-ui, body bg |
| **Commit**: `feat(client): redesign header and footer with V1 brand` |

### F3: Client Components
| File | Action |
|------|--------|
| `packages/shared/src/components/ui/Button/Button.module.css` | Update variant colors, add whatsapp/large/full variants |
| `packages/shared/src/components/ui/Card/Card.module.css` | Rewrite — green left border, hover elevation |
| `packages/shared/src/components/ui/Card/Card.tsx` | Add badge + image optional props |
| `packages/shared/src/components/ui/Badge/Badge.tsx` | Create new shared component |
| `packages/shared/src/components/ui/Badge/Badge.module.css` | Create — green accent, uppercase styles |
| All `*Card.module.css` files in client-site sections | Align to shared Card styles (green left border, shadow) |
| **Commit**: `feat(shared): update Button and Card to V1 brand, add Badge` |

### F4: Client Pages
| File | Action |
|------|--------|
| `client-site/src/pages/Home/Home.module.css` | Add hero section styles (gradient, overlay, badges, CTAs) |
| `client-site/src/pages/Services/Services.module.css` | Add gradient page header |
| `client-site/src/pages/Contact/Contact.module.css` | Add gradient hero |
| `client-site/src/styles/globals.css` | Add fade-in + slide-up animations |
| **Commit**: `feat(client): apply V1 brand to page sections` |

### F5: Recruiter Site
| File | Action |
|------|--------|
| `recruiter-site/src/components/layout/Header.tsx` | Match client-site pattern (fixed, gradient, etc.) |
| `recruiter-site/src/components/layout/Header.module.css` | Rewrite (same as client-site F2) |
| `recruiter-site/src/components/layout/Footer.tsx` | Match client-site pattern (social icons, grid) |
| `recruiter-site/src/components/layout/Footer.module.css` | Rewrite (same as client-site F2) |
| `recruiter-site/src/index.css` | Add V1 global overrides |
| `recruiter-site/src/components/layout/Layout.module.css` | Add padding-top for fixed header |
| **Commit**: `feat(recruiter): apply V1 brand to layout components` |

### F6: Admin Panel
| File | Action |
|------|--------|
| `admin-panel/src/components/layout/Header.module.css` | Add gradient background, V1 brand colors |
| `admin-panel/src/components/layout/Sidebar.module.css` | Add `--color-blue-base` bg, green active nav |
| `admin-panel/src/components/layout/DashboardLayout.module.css` | Add V1 brand bg colors |
| `admin-panel/src/index.css` | Import shared variables |
| **Commit**: `feat(admin): apply V1 brand colors via CSS Modules` |

### F7: Polish
| File | Action |
|------|--------|
| `globals.css` (all 3 frontends) | Add `prefers-reduced-motion` rules |
| All animation CSS | Verify `@media (hover: hover)` wrapping |
| All components | Responsive verification at 375px / 768px / 1440px |
| **Commit**: `feat: add animations, reduced motion, responsive polish` |

---

## 8. Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| TypeScript | All packages | `pnpm -r run typecheck` — must pass with 0 errors after each phase |
| API Tests | Backend | `pnpm --filter @jsoft/api test` — 62/62 passing (unaffected but verified) |
| Visual (manual) | Header, Footer, Cards, Hero, Page headers | Check at 375px / 768px / 1440px per frontend after each phase |
| Contrast (manual) | All new color combos | Verify WCAG AA (≥4.5:1 ratio) for text on V1 backgrounds |
| Build | All 3 frontends | `pnpm build` must succeed after each phase |

**Note**: No frontend testing infrastructure exists. All verification is manual visual inspection + TypeScript compilation.

---

## 9. Rollout

Per proposal: each phase independently revertible via `git revert <phase-commit>`. Git commit after each phase completes. F1 (token addition) never breaks existing code — F2+ migrations are per-component and can be rolled back individually.

---

## 10. Open Questions

1. **Social icons**: WhatsApp, LinkedIn, GitHub, email confirmed. Any additional platforms needed?
2. **Logo**: V1 used an SVG logo image. Should we create an SVG logo or keep text "J Soft Solutions" with brand colors?
3. **Recruiter hero**: Full hero section (gradient, overlay, CTAs) identical to client-site, or simplified page header?
4. **Admin panel header**: Full gradient + scroll behavior matching public sites, or simplified gradient-only version?

---

## Summary of Files Changed

| Phase | Files | Type |
|-------|-------|------|
| F0 | 6 files (admin-panel) | Prerequisite |
| F1 | 1 file (variables.css) | Tokens |
| F2 | 5 files (client-site layout) | Layout |
| F3 | 5-6 files (shared components) | Components |
| F4 | 3-4 files (client pages) | Pages |
| F5 | 6 files (recruiter-site layout) | Layout |
| F6 | 4 files (admin-panel layout) | Layout |
| F7 | 4 files (globals.css across frontends) | Polish |
| **Total** | **~34-36 files** | |
