# Spec: Implement Recruiter Site

5 new capabilities — full specs, no existing behavior. Built as a public-facing SPA at `recruiter-site/`.

---

## recruiter-layout (3 scenarios)

Global header navigation and footer shared across all recruiter site pages.

### Requirement: Header Navigation
The system SHALL render a header with navigation links: Inicio `/`, Proyectos `/proyectos`, Blog `/blog`, Contacto `/contacto`. The active route SHALL be visually highlighted via `NavLink` `isActive`.

- **Scenario**: Navigate via header — clicking any nav link navigates to the target route
- **Scenario**: Active route highlighted — navigating to `/proyectos` highlights "Proyectos" link

### Requirement: Footer
The system SHALL render a footer with the current year copyright and social icons (WhatsApp, LinkedIn, GitHub, email).

- **Scenario**: Render footer — any recruiter page shows copyright notice and social link icons

---

## recruiter-home (6 scenarios)

Hero landing with profile toggle, tech stack carousel, and recent projects carousel.

### Requirement: Hero with ProfileToggle
The system SHALL render a hero section at `/` with a toggle switching between Profesional and Técnico profile text. Default state SHALL be "Profesional".

- **Scenario**: Render default profile — hero loads with Profesional text and toggle default
- **Scenario**: Toggle to Técnico — clicking toggle switches text and updates state

### Requirement: TechStack Carousel
The system SHALL display an auto-rotating Embla carousel with 3 groups: Frontend, Backend, Complementary. Static TypeScript data with typed `TechGroup[]`.

- **Scenario**: Auto-rotation renders groups — three groups auto-rotate via Embla carousel
- **Scenario**: Manual navigation pauses auto-rotation — clicking a dot or swiping navigates to selected group and pauses auto-rotation temporarily

### Requirement: RecentProjects Carousel
The system SHALL fetch `GET /api/projects/recent` and display up to 3 recent projects in a carousel.

- **Scenario**: Projects load successfully — carousel shows projects with title, description, and thumbnail
- **Scenario**: Empty or error state — API returns empty/error, displays "No projects available" state

---

## recruiter-projects (6 scenarios)

Aggregated project listing with classification/type filters, pagination, and a detail modal that fetches technical content from individual endpoints.

### Requirement: Project Listing
The system SHALL fetch `GET /api/projects` and display a filterable, paginated list of project cards.

- **Scenario**: Render project list — shows cards with title, description, classification, type, and thumbnail
- **Scenario**: Filter by classification — selecting a classification filter re-fetches with classification query param
- **Scenario**: Paginate results — clicking pagination control displays next/previous page

### Requirement: Detail Modal
The system SHALL open a modal on project click, fetching the individual entity endpoint for `technicalExplanation` (sanitized via DOMPurify) and `technicalImages`.

- **Scenario**: Open modal for Service — fetches `GET /api/services/:slug` and renders content
- **Scenario**: Open modal for Product — fetches `GET /api/products/:slug` and renders content
- **Scenario**: Open modal for Tool — fetches `GET /api/tools/:slug` and renders content
- **Scenario**: Entity not found — 404 from endpoint shows "Project not found" error state
- **Scenario**: Close modal — clicking close/backdrop closes modal, scroll position preserved

**Endpoint mapping**: SERVICE→`/services`, PRODUCT→`/products`, TOOL→`/tools`, SUCCESS_CASE→`/success-cases`

---

## recruiter-blog (4 scenarios)

Published blog posts grid and individual post detail pages.

### Requirement: Blog Grid
The system SHALL fetch `GET /api/blog-posts?status=PUBLISHED` and display a 3-column grid with title, excerpt, coverImage, category, and date.

- **Scenario**: Render published grid — posts display in 3-column grid layout
- **Scenario**: Empty grid — API returns empty, shows "No posts published yet" state

### Requirement: Blog Post Page
The system SHALL render an individual post at `/blog/:slug` with full body (sanitized via DOMPurify), coverImage, category, externalLink, and lessonsLearned.

- **Scenario**: Render post detail — navigating to `/blog/:slug` renders all fields, externalLink opens in new tab
- **Scenario**: Post not found — invalid slug shows 404 page

---

## recruiter-contact (4 scenarios)

Recruiter contact form validated with the shared schema and social links display.

### Requirement: Contact Form
The system SHALL render a contact form at `/contacto` validated with `recruiterContactSchema` from `@jsoft/shared`. On valid submission, it SHALL POST `{...formData, originType: "RECRUITER"}` to `/api/contact/recruiter`.

- **Scenario**: Successful submission — valid form sends POST with `originType: "RECRUITER"`, success message displayed
- **Scenario**: Validation errors — invalid data shows field-level errors, no API call made
- **Scenario**: API error — 4xx/5xx error keeps form filled, retry button available

### Requirement: Social Links
The system SHALL display clickable social links for WhatsApp, LinkedIn, GitHub, and email on the contact page.

- **Scenario**: Render social links — icons displayed with href targets

---

## Routes Overview

| Path | Page | Domain |
|------|------|--------|
| `/` | HomePage | recruiter-home |
| `/proyectos` | ProjectsPage | recruiter-projects |
| `/blog` | BlogPage | recruiter-blog |
| `/blog/:slug` | BlogPostPage | recruiter-blog |
| `/contacto` | ContactPage | recruiter-contact |
| `*` | NotFoundPage | recruiter-layout |

## Files Created

~50 files across 6 domains. Full list in `design.md`. Key structure:

```
recruiter-site/src/
├── api/client.ts              — createApiClient() from @jsoft/shared
├── App.tsx                    — BrowserRouter + Routes + Layout
├── main.tsx                   — QueryClientProvider + StrictMode
├── components/
│   ├── layout/                — Header, Footer, Layout (with Outlet)
│   ├── home/                  — Hero, ProfileToggle, TechStack, RecentProjects
│   ├── projects/              — ProjectCard, ProjectList, ProjectDetailModal
│   ├── blog/                  — BlogCard, BlogGrid, BlogPostContent
│   ├── contact/               — RecruiterContactForm
│   └── common/                — SectionTitle
├── hooks/
│   ├── useProjects.ts         — useProjects, useRecentProjects, useProjectClassifications, useProjectDetail
│   ├── useBlogPosts.ts        — useBlogPosts, useBlogPostBySlug
│   └── useContactForm.ts      — useSubmitContact (POST /api/contact/recruiter)
├── pages/                     — HomePage, ProjectsPage, BlogPage, BlogPostPage, ContactPage, NotFoundPage
├── data/tech-stack.ts         — Static TechGroup[] (Frontend, Backend, Complementary)
├── styles/globals.css         — Reset + CSS variables from @jsoft/shared
├── index.css                  — Global styles + design token imports
└── types/index.ts             — ProjectSummary + TechGroup types
```

## Data Flow

1. **API client**: `createApiClient()` from `@jsoft/shared` — Vite proxy `/api` → `localhost:3000`
2. **TanStack Query**: Hooks per entity with suspense-like loading states
3. **Detail modal**: Fetch individual endpoint only when modal opens (lazy), not pre-fetched
4. **HTML sanitization**: `DOMPurify.sanitize()` on `technicalExplanation` and blog body before `dangerouslySetInnerHTML`

## Key Technical Constraints

- MUST use `?status=PUBLISHED` when fetching blog posts (API may include DRAFT by default)
- MUST use DOMPurify on any HTML content rendered via `dangerouslySetInnerHTML` (3 usages: ProjectDetailModal, BlogPostContent body + lessonsLearned)
- Carousels MUST use Embla (`embla-carousel-react`) — same library as client-site
- CSS Modules for all styling (no Tailwind/scss)
- React Router v7 SPA with BrowserRouter
