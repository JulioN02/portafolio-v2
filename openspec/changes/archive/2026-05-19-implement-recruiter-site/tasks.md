# Tasks: Implement Recruiter Site

> **Archived**: 2026-05-19 — All 33 tasks complete. Verified with tsc --noEmit (0 errors), 23/23 scenarios passing.

## Phase 1: Infrastructure

- [x] 1.1 Add deps to `recruiter-site/package.json`: `@tanstack/react-query`, `react-router-dom`, `embla-carousel-react`, `dompurify`, `@types/dompurify`
- [x] 1.2 Create `recruiter-site/src/styles/globals.css` — reset + CSS variables import from `@jsoft/shared`
- [x] 1.3 Create `recruiter-site/src/index.css` — global styles + design token imports
- [x] 1.4 Create `recruiter-site/src/api/client.ts` — `apiClient = createApiClient()` from `@jsoft/shared`
- [x] 1.5 Create `recruiter-site/src/data/tech-stack.ts` — static TechGroup[] (Frontend, Backend, Complementary)

## Phase 2: Layout Shell

- [x] 2.1 Create `recruiter-site/src/components/layout/Header.tsx` + `Header.module.css` — nav: Inicio, Proyectos, Blog, Contacto, active route highlight
- [x] 2.2 Create `recruiter-site/src/components/layout/Footer.tsx` + `Footer.module.css` — copyright + social links
- [x] 2.3 Create `recruiter-site/src/components/layout/Layout.tsx` + `Layout.module.css` — Header + Outlet + Footer wrapper
- [x] 2.4 Create `recruiter-site/src/main.tsx` — QueryClientProvider + BrowserRouter + StrictMode
- [x] 2.5 Create `recruiter-site/src/App.tsx` — Routes with Layout, 6 routes (`/`, `/proyectos`, `/blog`, `/blog/:slug`, `/contacto`, `*`)

## Phase 3: Home Page

- [x] 3.1 Create `recruiter-site/src/hooks/useProjects.ts` — `useProjects(filters?)`, `useRecentProjects()`, `useProjectDetail(type, slug)`
- [x] 3.2 Create `recruiter-site/src/components/home/Hero.tsx` + `Hero.module.css` — foto, nombre, título, resumen
- [x] 3.3 Create `recruiter-site/src/components/home/ProfileToggle.tsx` + `ProfileToggle.module.css` — toggle Profesional/Técnico
- [x] 3.4 Create `recruiter-site/src/components/home/TechStack.tsx` + `TechStack.module.css` — Embla carousel from static data
- [x] 3.5 Create `recruiter-site/src/components/home/RecentProjects.tsx` + `RecentProjects.module.css` — Embla carousel via `useRecentProjects()`
- [x] 3.6 Update `recruiter-site/src/pages/HomePage.tsx` — compose Hero + ProfileToggle + TechStack + RecentProjects + CTA

## Phase 4: Projects Page

- [x] 4.1 Create `recruiter-site/src/components/projects/ProjectCard.tsx` + `ProjectCard.module.css` — card with title, classification, preview image
- [x] 4.2 Create `recruiter-site/src/components/projects/ProjectDetailModal.tsx` + `ProjectDetailModal.module.css` — modal with DOMPurify-sanitized `technicalExplanation`
- [x] 4.3 Create `recruiter-site/src/components/projects/ProjectList.tsx` — grid of ProjectCards + filters for type/classification
- [x] 4.4 Create `recruiter-site/src/pages/ProjectsPage.tsx` — ProjectList with `useProjects()`, modal on card click

## Phase 5: Blog

- [x] 5.1 Create `recruiter-site/src/hooks/useBlogPosts.ts` — `useBlogPosts(page?)`, `useBlogPostBySlug(slug)` with `?status=PUBLISHED`
- [x] 5.2 Create `recruiter-site/src/components/blog/BlogCard.tsx` + `BlogCard.module.css` — card with cover, title, category, date
- [x] 5.3 Create `recruiter-site/src/components/blog/BlogGrid.tsx` — 3-column grid of BlogCards
- [x] 5.4 Create `recruiter-site/src/components/blog/BlogPostContent.tsx` + `BlogPostContent.module.css` — DOMPurify body, coverImage, lessonsLearned, externalLink
- [x] 5.5 Create `recruiter-site/src/pages/BlogPage.tsx` — BlogGrid with pagination
- [x] 5.6 Create `recruiter-site/src/pages/BlogPostPage.tsx` — `useBlogPostBySlug(slug)`, 404 on missing

## Phase 6: Contact

- [x] 6.1 Create `recruiter-site/src/hooks/useContactForm.ts` — `useSubmitContact()` mutation, POST with `originType: "RECRUITER"`
- [x] 6.2 Create `recruiter-site/src/components/contact/RecruiterContactForm.tsx` + `RecruiterContactForm.module.css` — validate with `recruiterContactSchema`, field errors, success state
- [x] 6.3 Create `recruiter-site/src/pages/ContactPage.tsx` — RecruiterContactForm + social links (WhatsApp, LinkedIn, GitHub, email)

## Phase 7: Polish & Common

- [x] 7.1 Create `recruiter-site/src/components/common/SectionTitle.tsx` + `SectionTitle.module.css` — reusable title with gradient accent underline, used in TechStack and RecentProjects
- [x] 7.2 Create `recruiter-site/src/pages/NotFoundPage.tsx` + `NotFoundPage.module.css` — full 404 page with gradient 404 text, Spanish message, back-to-home button
- [x] 7.3 Verify all 6 routes render: `/` → HomePage, `/proyectos` → ProjectsPage, `/blog` → BlogPage, `/blog/:slug` → BlogPostPage, `/contacto` → ContactPage, `*` → NotFoundPage
- [x] 7.4 Run `tsc --noEmit` type-check on `recruiter-site/src` — 0 errors
