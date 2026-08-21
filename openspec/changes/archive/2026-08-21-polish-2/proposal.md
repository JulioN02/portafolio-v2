# Proposal: Polish 2

## Intent

Address quality gaps across all 3 frontends: missing SEO meta tags, no error resilience, incomplete lazy loading, responsive layout bugs, console warnings, and un-sanitized HTML. Makes the app production-ready without changing functionality.

## Scope

### In Scope
- SEO: `react-helmet-async` per-page meta tags (title, description, OG) — Client + Recruiter
- Error Boundaries: Class-based ErrorBoundary wrapper per page + root router level — All 3 FE
- Lazy Loading: `loading="lazy"` on remaining `<img>` tags + `React.lazy()` for heavy components — All 3 FE
- Responsive: Fix layout at 375px/768px/1440px; fix touch hover states — All 3 FE
- Console Clean: React key warnings, missing alt text, a11y attributes — All 3 FE
- Sanitization: Wrap all `dangerouslySetInnerHTML` with DOMPurify — Client + Recruiter

### Out of Scope
- Cloudinary integration (Polish 3)
- Railway deploy / Docker setup
- Tests (no frontend test infra)
- Building a Client Site Blog page (doesn't exist yet; seo meta may be noted as future)

## Capabilities

### New Capabilities
None — pure quality refinement, no new spec-level behavior introduced.

### Modified Capabilities
None — existing specs (recruiter-home, recruiter-blog, etc.) do not change their requirements.

## Approach

| Area | Approach |
|------|----------|
| SEO | Install `react-helmet-async` in client-site + recruiter-site. Create shared `<MetaTags>` component. Inject per-page title/description/OG in each page component. |
| Error Boundaries | Create `<ErrorBoundary>` class component (shared via `@jsoft/shared` or duplicated per FE). Wrap each page in App.tsx + top-level router outlet in main.tsx. Fallback: friendly message with retry button. |
| Lazy Loading | Audit all `<img>` — add `loading="lazy"` where missing. Identify heavy components (`BlogPostContent`, `ProjectDetailModal`, admin CRUD forms), wrap with `React.lazy() + Suspense`. |
| Responsive | Manual review at 375px / 768px / 1440px per frontend. Fix CSS overflows, touch target < 44px, sticky hover on mobile. |
| Console Clean | Open browser console, fix all warnings. Focus: React keys in `.map()` iterators, missing `alt`, `aria-*` attributes. |
| Sanitization | Install `dompurify` + `@types/dompurify` in client-site (recruiter-site has it). Wrap `ServiceDetail.tsx` fullDescription. Verify all 4 `dangerouslySetInnerHTML` sites. |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `client-site/src/App.tsx` | Modified | Add ErrorBoundary wrappers + Suspense boundaries |
| `client-site/src/pages/*` | Modified | Add MetaTags per page; add loading="lazy"; fix warnings |
| `client-site/src/pages/Services/ServiceDetail.tsx` | Modified | Sanitize fullDescription with DOMPurify |
| `recruiter-site/src/App.tsx` | Modified | Add ErrorBoundary wrappers + Suspense boundaries |
| `recruiter-site/src/pages/*` | Modified | Add MetaTags per page; fix warnings |
| `admin-panel/src/routes/AppRoutes.tsx` | Modified | Add ErrorBoundary wrappers |
| `admin-panel/src/pages/*` | Modified | Add loading="lazy"; lazy-load CRUD forms; fix warnings |
| `@jsoft/shared` (new component) | New | Optional: shared ErrorBoundary or MetaTags component |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Error boundary catches real errors silently | Low | Log errors to console; verify no crash regressions |
| Lazy loading shifts layout (CLS) | Med | Set explicit `width`/`height` on lazy images; use Suspense fallbacks |
| Responsive CSS changes break existing layouts | Med | Test all 3 breakpoints per page before/after |
| DOMPurify breaks rendered HTML content | Low | Use `DOMPurify.sanitize()` with permissive config; test blog posts with rich HTML |

## Rollback Plan

Revert the commit. Each area is isolated — can roll back individual package changes independently. If `@jsoft/shared` is modified, rebuild shared first.

## Dependencies

- `react-helmet-async` (add to client-site + recruiter-site)
- `dompurify` + `@types/dompurify` (add to client-site if missing)

## Success Criteria

- [ ] Each route in client-site + recruiter-site has unique `<title>` and OG meta tags
- [ ] Component crash shows fallback UI instead of white screen
- [ ] No `loading="lazy"` missing on below-fold images across all 3 FE
- [ ] All 3 frontends render correctly at 375px, 768px, 1440px
- [ ] Browser console shows 0 errors and 0 warnings on all routes
- [ ] All `dangerouslySetInnerHTML` calls pass through `DOMPurify.sanitize()`
