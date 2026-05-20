# Proposal: Implement Recruiter Site

## Intent

Build a public-facing portfolio site for recruiters showing technical capabilities, projects, blog, and contact form. The `recruiter-site/` has config files but zero source code.

## Scope

### In Scope
- 6 pages: Home (scrollable hero/stack/projects), Projects (listing + detail modal), Blog (grid), BlogPost (detail), Contact (form + social links), NotFound
- Home sections: Hero + ProfileToggle (Profesional/Técnico), TechStack carousel (3 groups), RecentProjects carousel (3 items)
- Projects: classification/type filters + pagination; detail modal fetches individual endpoint for technicalExplanation/technicalImages
- Blog: 3-col grid, only PUBLISHED posts; individual post with body, image, lessons, GitHub link
- Contact: form with `recruiterContactSchema`, posts to `POST /api/contact` with `originType=RECRUITER`; social links (WhatsApp, LinkedIn, GitHub, email)
- Layout with Header (nav: Inicio, Proyectos, Blog, Contacto) + Footer
- API client, TanStack Query hooks, CSS Modules

### Out of Scope
- Authentication (fully public)
- Content management / CRUD (read-only)
- Dynamic hero/perfil (static data in v1)
- Dynamic tech stack (static TypeScript data in v1)
- E2E tests

## Capabilities

### New Capabilities
- `recruiter-home`: Hero, ProfileToggle, TechStack carousel, RecentProjects carousel
- `recruiter-projects`: Aggregated project listing with filters, pagination, detail modal with technicalExplanation/technicalImages
- `recruiter-blog`: Blog grid (PUBLISHED only), individual post page
- `recruiter-contact`: Recruiter contact form + social links
- `recruiter-layout`: Header nav + Footer

### Modified Capabilities
None

## Approach

Hybrid structure (recommended by exploration): mirror client-site's top-level (api/, hooks/, pages/) with domain-organized components (home/, projects/, blog/). Pages at root level: Home, Projects, Blog, BlogPost, Contact, NotFound. Use `createApiClient()` from `@jsoft/shared`, TanStack Query for data fetching, React Router v7 for routing. Project detail fetches individual endpoints per entity type. Add `dompurify` for HTML sanitization of technicalExplanation.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `recruiter-site/src/` | New | Full source tree (~30 files) |
| `recruiter-site/package.json` | Modified | Add `dompurify` + `@types/dompurify` |
| `api/src/services/projects.service.ts` | Optional | Could extend to include technical fields in detail endpoint |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|-------------|
| Projects endpoint returns summary only | High | Fetch individual entity endpoints for detail modal |
| HTML in technicalExplanation causes XSS | Medium | Use `dompurify` to sanitize before `dangerouslySetInnerHTML` |
| Blog posts API includes DRAFT by default | Medium | Explicitly pass `?status=PUBLISHED` |
| Profile toggle complex responsive | Low | CSS Modules + media queries, test on mobile/tablet/desktop |

## Rollback Plan

1. Remove `recruiter-site/src/` directory entirely
2. Revert `package.json` (remove dompurify deps)
3. `git checkout -- recruiter-site/` if needed

## Dependencies

- API server running on localhost:3000
- `@jsoft/shared` with `createApiClient()`, `recruiterContactSchema`, `BlogPostResponse`
- `dompurify` for HTML sanitization
- Carousel library (Embla, already used in client-site)

## Success Criteria

- [ ] Home renders hero, profile toggle switches text, tech stack carousel auto-rotates
- [ ] Projects page lists all items with filters and pagination, detail modal shows technical info
- [ ] Blog shows only PUBLISHED posts in 3-col grid
- [ ] Contact form submits to API with originType=RECRUITER, shows success/error feedback
- [ ] All routes work: `/`, `/proyectos`, `/proyectos/:slug`, `/blog`, `/blog/:slug`, `/contacto`
- [ ] No API errors in console (all endpoints return valid data)
