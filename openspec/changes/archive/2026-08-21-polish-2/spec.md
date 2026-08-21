# Polish 2 — Consolidated Specification

## Overview

Six quality domains across 3 frontends (client-site, recruiter-site, admin-panel) of a pnpm monorepo. All are new specs (no existing main specs to modify). Each domain is fully specified in its individual file under `specs/{domain}/spec.md`.

## Domain Summary

| Domain | Type | Affected Frontends | Key Requirements |
|--------|------|--------------------|------------------|
| SEO | New | client-site, recruiter-site | Per-route `<title>`, OG/Twitter tags, canonical URLs via `react-helmet-async` |
| Error Boundaries | New | All 3 | Class-based ErrorBoundary per page + top-level, "Algo salió mal" fallback with retry |
| Lazy Loading | New | All 3 | `loading="lazy"` on below-fold `<img>`, `React.lazy()` + Suspense for heavy components |
| Responsive | New | All 3 | 375/768/1440px breakpoints, no horizontal scroll, 44x44px touch targets, hover-safe |
| Console Clean | New | All 3 | No key/alt/a11y warnings, no unhandled promise rejections |
| Sanitization | New | client-site, recruiter-site | `DOMPurify.sanitize()` on all `dangerouslySetInnerHTML` |

## Key Findings from Code Audit

- **SEO**: Zero `<Helmet>` usage exists — all frontends lack meta tags entirely.
- **Error Boundaries**: No ErrorBoundary component exists. `@jsoft/shared` has `<ErrorMessage>` (UI only, not a boundary).
- **Lazy Loading**: Most `<img>` tags in client-site and recruiter-site already have `loading="lazy"`. Admin-panel has 3 `<img>` tags without it.
- **Sanitization**: Recruiter-site (3 calls) already uses DOMPurify. Client-site (1 call in ServiceDetail.tsx) is unprotected. Admin-panel has zero `dangerouslySetInnerHTML`.

## Cross-Cutting Constraints

1. All specs avoid implementation details — they describe WHAT, not HOW.
2. Every requirement has at least one GIVEN/WHEN/THEN scenario.
3. Scenarios cover happy path, edge cases, and error states where applicable.
4. `admin-panel` is excluded from SEO and Sanitization (no public routes, no user HTML rendering).

## Full Spec References

- [SEO](./specs/seo/spec.md)
- [Error Boundaries](./specs/error-boundaries/spec.md)
- [Lazy Loading](./specs/lazy-loading/spec.md)
- [Responsive](./specs/responsive/spec.md)
- [Console Clean](./specs/console-clean/spec.md)
- [Sanitization](./specs/sanitization/spec.md)
