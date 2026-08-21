# Design: Polish 2

## Overview

Technical design for a 6-domain quality pass across 3 Vite + React 19 frontends (client-site, recruiter-site, admin-panel) in a pnpm monorepo. No new functionality — pure production hardening.

## Technical Approach

Six independent domains, each applied across the relevant frontends. Domains are isolated by design but share infrastructure through the `@jsoft/shared` package where appropriate. Each domain can be implemented and verified independently.

## Architecture Decisions

### 1. SEO

| Decision | Options | Chosen | Rationale |
|----------|---------|--------|-----------|
| Meta library | `react-helmet-async` vs Vite `@unhead/vue`-style plugin vs custom `<Helmet>` wrapper | **`react-helmet-async`** | Industry standard for React SPAs; supports nested Helmet overrides; works with React 19; `@unhead/vue` is Vue-specific. |
| Meta data definition | Per-page constant objects vs dynamic from API vs central config | **Hybrid**: static pages get constants, dynamic pages extract from API data | Static pages (Home, About) have fixed SEO; dynamic pages (BlogPost, ServiceDetail) need content-derived title/description. Central config adds unnecessary abstraction for just 2 dynamic pages. No need for a central SEO config file — each page owns its own. |
| Dynamic page SEO fetch | Fetch alongside content (same query) vs separate endpoint | **Single query** — extract title/description from existing API response | All dynamic pages already fetch full objects via `@tanstack/react-query`. No separate SEO endpoint needed. |
| HelmetProvider placement | Each frontend wraps at `main.tsx` vs each page individually | **`main.tsx`** — `<HelmetProvider>` wraps the entire app once | `react-helmet-async` requires a single provider at the top of the tree. Natural fit in `main.tsx` alongside `QueryClientProvider`. |

**Implementation**: Install `react-helmet-async` in client-site + recruiter-site. Add `<HelmetProvider>` to each `main.tsx`. Create a per-frontend `<MetaTags>` component that accepts `title`, `description`, `ogType`, `canonicalUrl`, `publishedTime` (for articles). Add `noindex` tag for NotFound pages.

### 2. Error Boundaries

| Decision | Options | Chosen | Rationale |
|----------|---------|--------|-----------|
| Shared vs per-FE | `@jsoft/shared` class component vs duplicated per frontend | **Shared** in `@jsoft/shared` | ErrorBoundary is a pure class component with zero dependencies. Fits naturally in shared. Each frontend can customize the fallback UI via props. Delivered as both the boundary class + a default `<ErrorFallback>` component. |
| Granularity | Page-level vs section-level vs top-level only | **Page-level + top-level safety net** | Per spec: every route gets its own boundary (so a crash on one page doesn't take down others), plus a root-level boundary in `main.tsx` as final catch-all. Section-level is over-engineered for this app's depth. |
| Fallback UI ownership | Shared component vs per-frontend | **Shared default + per-FE override via `fallback` prop** | Shared gives consistency; prop allows frontend-specific customization (e.g., admin-panel might want a different style). Default fallback: centered card with "Algo salió mal", error details in console, "Reintentar" button. |
| Error reporting | `console.error` vs API logging vs Sentry | **`console.error`** | Proposal explicitly excludes monitoring services. `console.error` meets the spec requirement. Simple, zero-infrastructure. Can upgrade to Sentry later (Polish 3 candidate). |

**Implementation**: Create `ErrorBoundary` class component + `ErrorFallback` UI component in `@jsoft/shared`. Export from package. Wrap each route element in App.tsx/AppRoutes.tsx using a `withBoundary()` helper. Add a top-level `<ErrorBoundary>` in each `main.tsx` inside providers but wrapping `<App />`.

### 3. Lazy Loading

| Decision | Options | Chosen | Rationale |
|----------|---------|--------|-----------|
| Components to lazy-load | All pages vs heavy components only vs bundle-size threshold | **React.lazy() for heavy components only** (>5KB estimated gzip): admin CRUD form pages, BlogPostContent, ProjectDetailModal | Per audit, most images already have `loading="lazy"`. The heavy components have external deps (DOMPurify, tiptap for admin forms). Page-level lazy loading for all routes would cause flash-of-loading on every navigation — not worth it for simple pages. |
| Suspense boundaries | Per-lazy-component vs grouped per-section | **Per lazy component** | Each lazy component is a page-level entry. Grouping doesn't help since they're independent routes. Single Suspense boundary per route element. |
| Loading fallback | Skeleton vs spinner vs nothing | **Skeleton matching layout dimensions** | Spec explicitly requires fallback dimensions matching final component to prevent CLS. Spinner causes layout shift. Skeleton maintains layout stability. |
| Image lazy loading | Native `loading="lazy"` vs Intersection Observer library | **Native `loading="lazy"`** | Browser support is universal (Chrome 77+, Firefox 75+, Safari 15.4+). No extra library. Already used in most `<img>` tags per audit. Only 3 admin-panel images need it added. |
| Image dimensions | Add explicit width/height vs not | **Add explicit `width`/`height`** where missing on lazy images | Prevents CLS when lazy image loads. Check existing `<img>` tags for missing dimensions. |

**Implementation**: 
- Admin-panel: wrap CRUD form pages (Create/Edit) with `React.lazy()` in AppRoutes.tsx. Add Suspense with skeleton fallback.
- Recruiter-site: wrap `<BlogPostContent>` import with `React.lazy()`.
- Client-site: wrap `<ServiceDetailPage>` with `React.lazy()` (heaviest page with gallery + contact modal).
- Add `loading="lazy"` to 3 admin-panel `<img>` tags.
- Ensure all lazy-loaded images have explicit `width` and `height`.

### 4. Responsive

| Decision | Options | Chosen | Rationale |
|----------|---------|--------|-----------|
| Breakpoint strategy | Mobile-first (`min-width`) vs desktop-first (`max-width`) | **Mobile-first** | Existing CSS patterns use mobile-first. Simpler mental model. Matches industry best practice. |
| CSS approach | CSS Modules media queries vs utility class library (Tailwind) | **CSS Modules** | Project already uses CSS Modules exclusively. Adding Tailwind for a single polish pass is disproportionate. Fixes go into existing `.module.css` files. |
| Touch target remediation | Add `min-width`/`min-height` to existing classes vs wrapper elements | **CSS-only**: add `min-width: 44px; min-height: 44px;` to `button`, `a` interactive classes + padding for small icon buttons | Simplest, least invasive. Icon buttons (e.g., carousel arrows) get `padding` expansion. Forms already have large inputs; ensure consistency. |
| Hover state fix | `@media (hover: hover)` wrapper vs `@media (pointer: coarse)` detection | **`@media (hover: hover)`** wrapper around all `:hover` styles in CSS modules | Standard pattern. `pointer: coarse` detects touch but not stylus/trackpad. `hover: hover` correctly distinguishes devices capable of hover. |

**Implementation**: Manual review at 375/768/1440px per frontend per page. Fix CSS overflows (`overflow-x: hidden` on body, `overflow-wrap: break-word` on text). Add `min-height: 44px` to all button/link/input classes. Wrap all `:hover` pseudo-classes with `@media (hover: hover)`. Fix sticky hover artifacts on mobile.

### 5. Console Clean

| Decision | Options | Chosen | Rationale |
|----------|---------|--------|-----------|
| Detection method | Manual browser audit vs ESLint plugin | **Both**: ESLint plugin for automated detection + manual browser audit for runtime warnings | ESLint catches static issues (missing keys, alt text) but misses runtime warnings (unhandled rejections, DOM nesting). Browser DevTools catches both. ESLint prevents regressions. |
| ESLint plugin | `eslint-plugin-react` (jsx-key) + `eslint-plugin-jsx-a11y` | **Install and configure** `eslint-plugin-react` (built into React 19) + `eslint-plugin-jsx-a11y` | Catches key/alt/a11y issues at lint time. Add to all 3 frontends. Configure to warn (not error) — existing code may have issues that get fixed in this pass. |
| Fix strategy | One pass per warning type vs per-page | **Per warning type across all files** | More systematic. Fix all `.map()` key issues across all 3 frontends in one pass, then all missing `alt` attributes, then all a11y attributes. Fewer context switches. |

**Implementation**: 
1. Install `eslint-plugin-jsx-a11y` in all 3 FEs, add `.eslintrc.cjs` or extend in `eslintConfig`.
2. Fix React key warnings: audit all `.map()` iterators, ensure stable `key` (not index) for dynamic lists.
3. Fix missing `alt` text: add `alt=""` for decorative, meaningful `alt` for informative images.
4. Fix a11y: add `aria-label` to icon buttons, associate label/input pairs.
5. Fix unhandled promise rejections: audit all async calls, add `.catch()` or try/catch.
6. Run ESLint after fixes, verify zero warnings.

### 6. Sanitization

| Decision | Options | Chosen | Rationale |
|----------|---------|--------|-----------|
| Utility wrapper | Shared `@jsoft/shared` sanitize util vs inline DOMPurify | **Inline DOMPurify** matching existing recruiter-site pattern | Recruiter-site already uses `DOMPurify.sanitize()` inline in 3 components. Client-site has 1 call site. A shared wrapper adds abstraction without benefit — the config is just `DOMPurify.sanitize(html)` with defaults. Keep pattern consistent. |
| Injection layer | API client layer vs component render layer | **Component render layer** (at `dangerouslySetInnerHTML` call site) | API layer should return raw content (needed for editing in admin-panel). Sanitization is a presentation concern. Also matches existing recruiter-site pattern of sanitizing at render time. |

**Implementation**:
- Add `dompurify` + `@types/dompurify` to client-site `package.json`.
- In `ServiceDetail.tsx`, change `<div dangerouslySetInnerHTML={{ __html: service.fullDescription }} />` to `<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(service.fullDescription) }} />`.
- Import `DOMPurify from 'dompurify'`.
- Recruiter-site is already covered (3 existing DOMPurify calls verified in audit).
- Admin-panel has zero `dangerouslySetInnerHTML` — no changes needed.

## Data Flow

No new data flows. Existing API responses are unchanged. The design adds:
- **SEO**: React Helmet reads from same `data` objects pages already use — no new API calls.
- **Error Boundaries**: Catch phase (lifecycle) — no data flow, purely React error handling.
- **Lazy Loading**: Dynamic imports via `React.lazy()` — same data, split bundles.
- **Responsive**: CSS-only — no data flow impact.
- **Console Clean**: Component props/attributes — no data flow impact.
- **Sanitization**: Data transformation at render — input unchanged, output sanitized.

```
[API Response] ──► [React Query cache] ──► [Page Component]
                                              │
                                              ├── [MetaTags] ← react-helmet-async (reads page data)
                                              ├── [ErrorBoundary] ← wraps page (lifecycle, no data)
                                              ├── [React.lazy()] ← code splitting (same data)
                                              └── [DOMPurify.sanitize()] ← transforms HTML at render
```

## File Changes

### New Files

| File | Domain | Description |
|------|--------|-------------|
| `packages/shared/src/components/ui/ErrorBoundary/ErrorBoundary.tsx` | Error Boundaries | Class-based ErrorBoundary with `getDerivedStateFromError` + `componentDidCatch`, renders `fallback` or `<ErrorFallback>` |
| `packages/shared/src/components/ui/ErrorBoundary/ErrorFallback.tsx` | Error Boundaries | Default fallback UI: "Algo salió mal" message + "Reintentar" button |
| `packages/shared/src/components/ui/ErrorBoundary/ErrorBoundary.module.css` | Error Boundaries | Styles for fallback UI |
| `packages/shared/src/components/ui/ErrorBoundary/index.ts` | Error Boundaries | Export barrel |
| `client-site/src/components/seo/MetaTags.tsx` | SEO | `<MetaTags>` component using `react-helmet-async` for client-site |
| `recruiter-site/src/components/seo/MetaTags.tsx` | SEO | `<MetaTags>` component using `react-helmet-async` for recruiter-site |

### Modified Files

#### SEO Domain

| File | Modification |
|------|--------------|
| `client-site/package.json` | Add `react-helmet-async` dependency |
| `recruiter-site/package.json` | Add `react-helmet-async` dependency |
| `client-site/src/main.tsx` | Import `HelmetProvider` from `react-helmet-async`, wrap app |
| `recruiter-site/src/main.tsx` | Import `HelmetProvider` from `react-helmet-async`, wrap app |
| `client-site/src/pages/Home/index.tsx` | Add `<MetaTags>` with title="JSoft Soluciones", description, OG |
| `client-site/src/pages/Services/index.tsx` | Add `<MetaTags>` with title="Servicios | JSoft Soluciones" |
| `client-site/src/pages/Services/ServiceDetail.tsx` | Add `<MetaTags>` with dynamic title from `service.title` |
| `client-site/src/pages/Products/index.tsx` | Add `<MetaTags>` with title="Productos | JSoft Soluciones" |
| `client-site/src/pages/Tools/index.tsx` | Add `<MetaTags>` with title="Herramientas | JSoft Soluciones" |
| `client-site/src/pages/SuccessCases/index.tsx` | Add `<MetaTags>` with title="Casos de Éxito | JSoft Soluciones" |
| `client-site/src/pages/Contact/index.tsx` | Add `<MetaTags>` with title="Contacto | JSoft Soluciones" |
| `client-site/src/pages/NotFound/index.tsx` | Add `<MetaTags>` with title="404 - Página no encontrada", `noindex` |
| `recruiter-site/src/pages/HomePage.tsx` | Add `<MetaTags>` with title, description, OG |
| `recruiter-site/src/pages/ProjectsPage.tsx` | Add `<MetaTags>` with title="Proyectos" |
| `recruiter-site/src/pages/BlogPage.tsx` | Add `<MetaTags>` with title="Blog" |
| `recruiter-site/src/pages/BlogPostPage.tsx` | Add `<MetaTags>` with dynamic title from `post.title`, `og:type="article"`, `article:published_time` |
| `recruiter-site/src/pages/ContactPage.tsx` | Add `<MetaTags>` with title="Contacto" |
| `recruiter-site/src/pages/NotFoundPage.tsx` | Add `<MetaTags>` with title="404 - Página no encontrada", `noindex` |

#### Error Boundaries Domain

| File | Modification |
|------|--------------|
| `packages/shared/src/components/index.ts` | Export `ErrorBoundary` and `ErrorFallback` |
| `packages/shared/src/index.ts` | Export `ErrorBoundary` and `ErrorFallback` |
| `client-site/src/App.tsx` | Import `ErrorBoundary`, wrap each route element with `withBoundary()` helper OR inline `<ErrorBoundary>` |
| `client-site/src/main.tsx` | Add top-level `<ErrorBoundary>` wrapping `<App />` |
| `recruiter-site/src/App.tsx` | Wrap each route element with `ErrorBoundary` |
| `recruiter-site/src/main.tsx` | Add top-level `<ErrorBoundary>` wrapping `<App />` |
| `admin-panel/src/routes/AppRoutes.tsx` | Wrap each route element with `ErrorBoundary` (use helper for cleaner code) |
| `admin-panel/src/main.tsx` | Add top-level `<ErrorBoundary>` wrapping `<App />` |

#### Lazy Loading Domain

| File | Modification |
|------|--------------|
| `client-site/src/App.tsx` | Replace `import { ServiceDetailPage }` with `React.lazy(() => import(...))`, add `<Suspense>` boundary |
| `recruiter-site/src/pages/BlogPostPage.tsx` | Lazy-import `BlogPostContent` with `React.lazy()`, wrap in `<Suspense>` with skeleton |
| `admin-panel/src/routes/AppRoutes.tsx` | Replace Create/Edit page imports with `React.lazy()` — focus on CRUD form pages (Services, Products, Tools, SuccessCases, BlogPosts Create/Edit) |
| `admin-panel/src/pages/blog-posts/BlogPostForm.tsx` (if exists) | Add `loading="lazy"` to image tags (3 identified) |
| `admin-panel/src/pages/services/ServiceForm.tsx` (if exists) | Check/add `loading="lazy"` to image tags |
| `admin-panel/src/pages/success-cases/SuccessCaseForm.tsx` (if exists) | Check/add `loading="lazy"` to image tags |

#### Responsive Domain

| File | Modification |
|------|--------------|
| `client-site/src/styles/globals.css` | Add `overflow-x: hidden` on body if missing |
| `client-site/src/**/*.module.css` | Fix horizontal overflows, add touch target sizes, wrap `:hover` in `@media (hover: hover)` |
| `recruiter-site/src/index.css` | Add `overflow-x: hidden` on body if missing |
| `recruiter-site/src/**/*.module.css` | Fix overflows, touch targets, hover states |
| `admin-panel/src/index.css` | Add `overflow-x: hidden` on body if missing |
| `admin-panel/src/**/*.module.css` | Fix overflows, touch targets, hover states |

#### Console Clean Domain

| File | Modification |
|------|--------------|
| `client-site/package.json` | Add `eslint-plugin-jsx-a11y` devDependency |
| `recruiter-site/package.json` | Add `eslint-plugin-jsx-a11y` devDependency |
| `admin-panel/package.json` | Add `eslint-plugin-jsx-a11y` devDependency |
| `client-site/src/**/*.tsx` | Fix `.map()` keys, add `alt` text, add `aria-label` where missing |
| `recruiter-site/src/**/*.tsx` | Fix `.map()` keys, add `alt` text, add `aria-label` where missing |
| `admin-panel/src/**/*.tsx` | Fix `.map()` keys, add `alt` text, add `aria-label` where missing |

#### Sanitization Domain

| File | Modification |
|------|--------------|
| `client-site/package.json` | Add `dompurify` + `@types/dompurify` dependency |
| `client-site/src/pages/Services/ServiceDetail.tsx` | Import `DOMPurify`, wrap `dangerouslySetInnerHTML` with `DOMPurify.sanitize()` |

## Implementation Order

```
Phase 1: Foundation (no dependencies)
├── 1a. Install all dependencies across all frontends
│    ├── client-site: react-helmet-async, dompurify, @types/dompurify, eslint-plugin-jsx-a11y
│    ├── recruiter-site: react-helmet-async, eslint-plugin-jsx-a11y
│    └── admin-panel: eslint-plugin-jsx-a11y
│
├── 1b. Error Boundaries (foundational safety net)
│    ├── Create ErrorBoundary + ErrorFallback in @jsoft/shared
│    ├── Export from shared package
│    ├── Wrap route elements in all 3 App.tsx files
│    └── Add top-level boundary in all 3 main.tsx files
│
└── 1c. Sanitization (simple security fix)
     └── Wrap dangerouslySetInnerHTML in ServiceDetail.tsx with DOMPurify

Phase 2: Content (depends on Phase 1 for safety)
├── 2a. SEO
│    ├── Add HelmetProvider to client-site + recruiter-site main.tsx
│    ├── Create MetaTags component per frontend
│    └── Add MetaTags to every page in both frontends
│
└── 2b. Lazy Loading (safe under ErrorBoundary)
     ├── Lazy-load heavy components in admin-panel routes
     ├── Lazy-load BlogPostContent in recruiter-site
     ├── Lazy-load ServiceDetailPage in client-site
     └── Add loading="lazy" + dimensions to admin-panel images

Phase 3: Polish (depends on Phase 2)
├── 3a. Console Clean
│    ├── ESLint config + run to identify issues
│    └── Fix all warnings across all 3 frontends
│
└── 3b. Responsive
     ├── Manual audit at 375/768/1440px per frontend
     └── Fix CSS in affected module.css files
```

## Testing Strategy

| Domain | Approach | Verification Method |
|--------|----------|---------------------|
| SEO | Visual + DevTools | Open each route, inspect `<head>` via DevTools. Verify title, OG, canonical, Twitter tags. |
| Error Boundaries | Manual | Throw a simulated error in a page component, verify fallback renders, "Reintentar" recovers, navigation to other pages works. |
| Lazy Loading | DevTools Network tab | Verify chunk files load on navigation (not on initial load). Check CLS with Performance tab. |
| Responsive | Manual resize | Open each page at 375/768/1440px. Check no horizontal scroll, touch targets ≥44px, no hover artifacts. |
| Console Clean | DevTools Console | Navigate all routes, verify 0 errors and 0 warnings. |
| Sanitization | Manual + code review | grep for `dangerouslySetInnerHTML` — verify every occurrence is wrapped in `DOMPurify.sanitize()`. Test with `<script>` in content. |

## Migration / Rollout

No migration required. All changes are additive or CSS-only. Each domain can be deployed independently. The `@jsoft/shared` ErrorBoundary addition is backwards-compatible (new exports, no breaking changes). If `@jsoft/shared` is rebuilt, all 3 frontends pick up the new component on next build.

## Open Questions

- [ ] Client-site: The `NotFound` page uses `<Navigate to="/404" replace />` in App.tsx. Should MetaTags be on the `NotFound` page component, or on the redirect catch-all route? The redirect to `/404` means the NotFoundPage component renders — MetaTags there is correct.
- [ ] Admin-panel: Verify that CRUD form pages (Create/Edit for Services, Products, Tools, SuccessCases, BlogPosts) are indeed heavy enough to warrant `React.lazy()`. Confirm with bundle analyzer output if available.
- [ ] Admin-panel: The `Settings` route uses `<Outlet>` with nested routes — confirm ErrorBoundary placement (wrap `SettingsLayout` vs individual settings pages).
