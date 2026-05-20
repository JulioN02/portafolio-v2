# Design: Implement Recruiter Site

## Overview

Build a public-facing SPA for recruiters inside `recruiter-site/` — 5 pages, CSS Modules, TanStack Query, Embla carousels. Mirrors `client-site/` patterns.

## Architecture Decisions

### Decision: SPA with React Router v7
**Choice**: React Router v7 SPA (same as client-site)  
**Alternatives**: Multi-page (MPA with Next.js)  
**Rationale**: Fully public site, no SSR needed. Consistency with existing client-site reduces cognitive overhead. SPA gives instant navigation.

### Decision: TanStack Query with lazy detail fetching
**Choice**: Single TanStack Query client, hooks per entity (`useProjects`, `useBlogPosts`, `useProjectDetail`, `useSubmitContact`)  
**Alternatives**: RTK Query, custom fetch hooks  
**Rationale**: Already in the monorepo. Hooks mirror client-site one-to-one. Detail modal fetches individual endpoint on click — avoids preloading unused data for 10+ entities.

### Decision: Project detail as modal, not separate page
**Choice**: Modal overlay for project detail with individual endpoint fetch  
**Alternatives**: Separate `/proyectos/:slug` page  
**Rationale**: Modal preserves scroll position and filter/pagination state. Recruiters can quickly scan items and peek at technical details without losing context.

### Decision: Static TypeScript data for tech stack + profile
**Choice**: Static `data/tech-stack.ts` with typed arrays of { group, icon, items[] }  
**Alternatives**: API endpoint, markdown files  
**Rationale**: Tech stack is infrequently updated. Eliminates an API call on home page load. V1 profile text is also static — easy to make dynamic later.

### Decision: CSS Modules (same as client-site)
**Choice**: CSS Modules with CSS custom properties from `@jsoft/shared`  
**Alternatives**: Tailwind, vanilla CSS  
**Rationale**: Consistency. Shared variables import gives design tokens for free. No tooling overhead.

### Decision: DOMPurify for all HTML rendering
**Choice**: `dompurify` on `technicalExplanation` and blog `body` before `dangerouslySetInnerHTML`  
**Rationale**: XSS mitigation for API-rendered HTML. Proposal identified this as medium risk.

## Data Flow

```
Browser → React Router → Page Component → TanStack Query hook → apiClient.get()
                                                                       ↓
                                                              Vite proxy (/api)
                                                                       ↓
                                                              localhost:3000 API
                                                                       ↓
                                                              JSON response → cache → render

Detail modal flow:
  User clicks card → setSelected(projectSummary) → open modal →
  useProjectDetail(type, slug) fetches individual endpoint →
  render sanitized technicalExplanation + technicalImages
```

## Tech Stack Data (Static)

```ts
// data/tech-stack.ts
interface TechGroup {
  group: 'Frontend' | 'Backend' | 'Complementary';
  icon: string;
  items: { name: string; level: 'Expert' | 'Advanced' | 'Intermediate'; logo?: string }[];
}

const techStack: TechGroup[] = [
  { group: 'Frontend', icon: '💻', items: [...] },
  { group: 'Backend', icon: '⚙️', items: [...] },
  { group: 'Complementary', icon: '🛠️', items: [...] },
];
```

## Routes

| Path | Page | Component | Params |
|------|------|-----------|--------|
| `/` | Home | HomePage | — |
| `/proyectos` | Projects | ProjectsPage | `?type, ?classification, ?page` |
| `/blog` | Blog | BlogPage | `?page` |
| `/blog/:slug` | Blog Post | BlogPostPage | `:slug` |
| `/contacto` | Contact | ContactPage | — |
| `*` | 404 | NotFoundPage | — |

## Component Tree

```
<Layout>
├── <Header /> — nav: Inicio, Proyectos, Blog, Contacto
├── <Outlet />
│   ├── HomePage
│   │   ├── <Hero /> + <ProfileToggle />
│   │   ├── <TechStackCarousel /> — Embla, 3 groups, auto-rotate
│   │   └── <RecentProjectsCarousel /> — Embla, useRecentProjects
│   │
│   ├── ProjectsPage
│   │   ├── <ProjectFilters /> — type + classification dropdowns
│   │   ├── <ProjectGrid>
│   │   │   └── <ProjectCard /> × N
│   │   ├── <Pagination />
│   │   └── <ProjectModal> (conditional)
│   │       ├── images, title, classification
│   │       └── technicalExplanation (sanitized) + technicalImages
│   │
│   ├── BlogPage
│   │   ├── <BlogGrid>
│   │   │   └── <BlogCard /> × N
│   │   └── <Pagination />
│   │
│   ├── BlogPostPage
│   │   ├── coverImage, title, category, publishedAt
│   │   ├── body (sanitized via DOMPurify)
│   │   ├── lessonsLearned
│   │   └── externalLink
│   │
│   ├── ContactPage
│   │   ├── <RecruiterContactForm />
│   │   └── <SocialLinks /> — WhatsApp, LinkedIn, GitHub, email
│   │
│   └── NotFoundPage
│
└── <Footer /> — copyright + social icons
```

## Hooks

| Hook | Endpoint | Query Key | Notes |
|------|----------|-----------|-------|
| `useProjects(filter)` | GET /api/projects | `['projects', filter]` | Paginated + filtered |
| `useRecentProjects()` | GET /api/projects/recent | `['projects', 'recent']` | Limited to 3 by default |
| `useProjectClassifications()` | GET /api/projects/classifications | `['projects', 'classifications']` | For filter dropdowns |
| `useProjectDetail(type, slug)` | GET /api/{type}s/{slug} | `[type, 'slug', slug]` | Fetched on modal open |
| `useBlogPosts(filter)` | GET /api/blog-posts?status=PUBLISHED | `['blog-posts', filter]` | Only PUBLISHED |
| `useBlogPost(slug)` | GET /api/blog-posts/{slug} | `['blog-posts', 'slug', slug]` | Single post |
| `useSubmitContact()` | POST /api/contact/recruiter | mutation | + originType=RECRUITER |

## File Changes (All New)

| File | Action |
|------|--------|
| `recruiter-site/package.json` | Modify — add `dompurify`, `@types/dompurify`, `embla-carousel-react` |
| `recruiter-site/src/main.tsx` | Create — QueryClientProvider + BrowserRouter |
| `recruiter-site/src/App.tsx` | Create — Routes with Layout + 6 pages |
| `recruiter-site/src/api/client.ts` | Create — apiClient from `@jsoft/shared` |
| `recruiter-site/src/types/index.ts` | Create — ProjectSummary + TechGroup types |
| `recruiter-site/src/data/tech-stack.ts` | Create — static tech stack data |
| `recruiter-site/src/styles/globals.css` | Create — reset + shared vars import |
| `recruiter-site/src/styles/css.d.ts` | Create — CSS Modules declaration |
| `recruiter-site/src/components/layout/Layout.tsx` | Create |
| `recruiter-site/src/components/layout/Layout.module.css` | Create |
| `recruiter-site/src/components/layout/Header.tsx` | Create |
| `recruiter-site/src/components/layout/Header.module.css` | Create |
| `recruiter-site/src/components/layout/Footer.tsx` | Create |
| `recruiter-site/src/components/layout/Footer.module.css` | Create |
| `recruiter-site/src/components/common/Carousel.tsx` | Create — re-usable Embla carousel |
| `recruiter-site/src/components/common/Carousel.module.css` | Create |
| `recruiter-site/src/components/common/Loading.tsx` | Create |
| `recruiter-site/src/components/common/Pagination.tsx` | Create |
| `recruiter-site/src/components/common/Pagination.module.css` | Create |
| `recruiter-site/src/components/home/Hero.tsx` | Create |
| `recruiter-site/src/components/home/Hero.module.css` | Create |
| `recruiter-site/src/components/home/ProfileToggle.tsx` | Create |
| `recruiter-site/src/components/home/ProfileToggle.module.css` | Create |
| `recruiter-site/src/components/home/TechStackCarousel.tsx` | Create — Embla carousel |
| `recruiter-site/src/components/home/TechStackCarousel.module.css` | Create |
| `recruiter-site/src/components/home/RecentProjectsCarousel.tsx` | Create |
| `recruiter-site/src/components/home/RecentProjectsCarousel.module.css` | Create |
| `recruiter-site/src/components/projects/ProjectCard.tsx` | Create |
| `recruiter-site/src/components/projects/ProjectCard.module.css` | Create |
| `recruiter-site/src/components/projects/ProjectFilters.tsx` | Create |
| `recruiter-site/src/components/projects/ProjectFilters.module.css` | Create |
| `recruiter-site/src/components/projects/ProjectModal.tsx` | Create — modal with DOMPurify |
| `recruiter-site/src/components/projects/ProjectModal.module.css` | Create |
| `recruiter-site/src/components/blog/BlogCard.tsx` | Create |
| `recruiter-site/src/components/blog/BlogCard.module.css` | Create |
| `recruiter-site/src/components/contact/RecruiterContactForm.tsx` | Create |
| `recruiter-site/src/components/contact/RecruiterContactForm.module.css` | Create |
| `recruiter-site/src/components/contact/SocialLinks.tsx` | Create |
| `recruiter-site/src/components/contact/SocialLinks.module.css` | Create |
| `recruiter-site/src/hooks/useProjects.ts` | Create |
| `recruiter-site/src/hooks/useProjectDetail.ts` | Create |
| `recruiter-site/src/hooks/useBlogPosts.ts` | Create |
| `recruiter-site/src/hooks/useBlogPost.ts` | Create |
| `recruiter-site/src/hooks/useContact.ts` | Create |
| `recruiter-site/src/pages/Home/index.tsx` | Create |
| `recruiter-site/src/pages/Home/Home.module.css` | Create |
| `recruiter-site/src/pages/Projects/index.tsx` | Create |
| `recruiter-site/src/pages/Projects/Projects.module.css` | Create |
| `recruiter-site/src/pages/Blog/index.tsx` | Create |
| `recruiter-site/src/pages/Blog/Blog.module.css` | Create |
| `recruiter-site/src/pages/BlogPost/index.tsx` | Create |
| `recruiter-site/src/pages/BlogPost/BlogPost.module.css` | Create |
| `recruiter-site/src/pages/Contact/index.tsx` | Create |
| `recruiter-site/src/pages/Contact/Contact.module.css` | Create |
| `recruiter-site/src/pages/NotFound/index.tsx` | Create |
| `recruiter-site/src/pages/NotFound/NotFound.module.css` | Create |

**Total: ~48 files created, 1 file modified (package.json)**

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| TypeScript | All files | `tsc --noEmit` — type-check entire src |
| Build | Production bundle | `pnpm --filter @jsoft/recruiter-site build` |
| Dev server | Manual smoke test | `pnpm --filter @jsoft/recruiter-site dev`, verify all 6 routes |

No migration required.

## Open Questions

- [ ] Confirm individual project endpoints (`GET /api/services/:slug`, `GET /api/products/:slug`, etc.) are public (not behind auth) — verified: all public routes.
