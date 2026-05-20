## Exploration: implement-recruiter-site

### Current State

**Recruiter Site**: Only configuration files exist (`package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`). **No `src/` directory** — from-scratch implementation.

**API (Fully Implemented)**: All required endpoints are operational:
- `GET /api/projects` — Unified aggregation of services + products + tools + successCases (supports `?type=`, `?classification=`, pagination)
- `GET /api/projects/recent` — Last N projects sorted by creation date (default 3)
- `GET /api/projects/classifications` — All unique classifications across entity types
- `GET /api/blog-posts` — Blog posts (including status filtering; recruiter needs only PUBLISHED)
- `GET /api/blog-posts/:slug` — Individual blog post detail
- `POST /api/contact/recruiter` — Recruiter contact form endpoint (uses `recruiterContactSchema`)
- `GET /api/services` — Individual services (for detailed views with technicalExplanation)
- Individual GET endpoints exist for products, tools, successCases with technical fields

**Shared Package**: Provides `createApiClient()`, Zod schemas (`recruiterContactSchema`, `blogPostSchema`, etc.), UI components (Button, Input, Card, Modal, Loading, ErrorMessage), and shared CSS variables.

**Client Site (Reference Pattern)**: Follows a consistent structure:
```
client-site/src/
├── api/client.ts                    # createApiClient({ baseUrl: '/api' })
├── components/
│   ├── layout/                      # Layout.tsx, Header.tsx, Footer.tsx
│   └── forms/                       # ContactForm.tsx
├── hooks/                           # Per-entity TanStack Query hooks
│   ├── useServices.ts
│   ├── useProducts.ts
│   ├── useTools.ts
│   ├── useSuccessCases.ts
│   └── useContact.ts
├── pages/                           # Per-page subdirectories
│   ├── Home/index.tsx
│   ├── Services/index.tsx
│   ├── Products/
│   ├── Contact/index.tsx
│   └── ...
├── styles/globals.css
├── App.tsx                          # <Routes> with <Layout> wrapper + <Outlet>
└── main.tsx                         # QueryClientProvider + BrowserRouter
```

**Prisma Schema — Recruiter-Specific Fields**:
- `Service.technicalExplanation` (String?) and `Service.technicalImages` (String[])
- `Product.technicalExplanation` (String?) and `Product.technicalImages` (String[])
- `Tool.technicalExplanation` (String?) and `Tool.technicalImages` (String[])
- `ContactForm.originType` enum: CLIENT | RECRUITER
- The projects aggregation endpoint (`/api/projects`) does NOT include technicalExplanation/technicalImages in its summary select — these would need individual entity detail calls or the projects endpoint to be extended.

**Existing Config**:
| Config | Value |
|--------|-------|
| Port | 5174 |
| Proxy | /api → http://localhost:3000 |
| @ alias | `@/` → `./src` |
| Dependencies | react 19, react-dom 19, react-router-dom 7, @tanstack/react-query 5, @jsoft/shared (workspace:*) |
| Dev Deps | vite 6, @vitejs/plugin-react 4, typescript 5.7, @types/react 19, @types/react-dom 19 |

### Affected Areas

- `recruiter-site/src/` — Needs COMPLETE creation (all files)
- `recruiter-site/package.json` — Already configured, potentially add `dompurify` for HTML sanitization of blog body
- `api/src/services/projects.service.ts` — May need extension to include `technicalExplanation`/`technicalImages` for project detail views (currently only returns summary fields)
- `openspec/changes/implement-recruiter-site/` — All SDD artifacts will go here
- `admin-panel/src/pages/ContactForms/` — Must handle RECRUITER vs CLIENT filtering (already implemented in API)

### Approaches

#### 1. **Clone client-site structure and adapt** — Follow exact same folder layout as client-site, adapting content for recruiter focus

```
recruiter-site/src/
├── api/client.ts
├── components/
│   ├── layout/
│   │   ├── Layout.tsx, Header.tsx, Footer.tsx
│   │   └── (CSS Modules per component)
│   └── forms/
│       └── RecruiterContactForm.tsx
├── hooks/
│   ├── useProjects.ts        # GET /api/projects, GET /api/projects/recent
│   ├── useBlogPosts.ts       # GET /api/blog-posts (PUBLISHED only)
│   ├── useContact.ts         # POST /api/contact/recruiter
│   └── useServices.ts        # GET /api/services/:slug for detail
├── pages/
│   ├── Home/index.tsx        # Hero + Profile Toggle + Tech Stack + Projects Carousel + CTA
│   ├── Projects/
│   │   ├── index.tsx         # Full project listing with filters + pagination
│   │   └── ProjectDetail.tsx # Modal with technicalExplanation + technicalImages
│   ├── Blog/
│   │   ├── index.tsx         # Blog listing grid (3 cols)
│   │   └── BlogPost.tsx      # Individual post with body, lessons
│   └── Contact/index.tsx     # Recruiter-specific contact form
├── styles/globals.css
├── App.tsx
└── main.tsx
```

| Pros | Cons | Effort |
|------|------|--------|
| ✅ Maximum consistency with client-site | ❌ Some client-site patterns don't apply (no entity-specific pages, no authentication) | Medium |
| ✅ Familiar for any developer who has seen client-site | ❌ Header nav needs different links (Proyectos, Blog, Contacto) vs client-site (Servicios, Productos, etc.) | |
| ✅ Easy to reuse patterns (hooks structure, layout, CSS modules) | ❌ Creates unnecessary duplication for the aggregated Projects page | |

#### 2. **Purpose-built structure for recruiter site** — Design folder structure around the recruiter-specific flows rather than mirroring client-site

```
recruiter-site/src/
├── api/client.ts
├── components/
│   ├── layout/
│   │   ├── Layout.tsx, Header.tsx, Footer.tsx
│   │   └── (recruiter-specific header with section scroll nav)
│   ├── home/
│   │   ├── Hero.tsx           # Personal hero section
│   │   ├── ProfileToggle.tsx  # Professional/Technical toggle
│   │   ├── TechStack.tsx      # Tech stack carousel
│   │   └── RecentProjects.tsx # Recent projects carousel
│   ├── projects/
│   │   ├── ProjectCard.tsx    # Card for project listing
│   │   ├── ProjectDetail.tsx  # Modal/detail with technical info
│   │   └── ProjectFilters.tsx # Classification/type filters
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   └── BlogDetail.tsx
│   └── forms/
│       └── RecruiterContactForm.tsx
├── data/
│   └── stack.ts               # Static tech stack data (Front/Back/Complementaries)
├── hooks/
│   ├── useProjects.ts
│   ├── useBlogPosts.ts
│   └── useContact.ts
├── pages/
│   └── Home.tsx               # SPA-like home with all sections (hero, projects, blog, contact)
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

| Pros | Cons | Effort |
|------|------|--------|
| ✅ Purpose-built for recruiter flows | ❌ Less consistent with client-site structure | Medium |
| ✅ Fewer files, more focused | ❌ Might need restructuring later if scope grows | |
| ✅ Home as single scrollable page (common for CV/portfolio sites) | ❌ New developer needs to learn different structure | |
| ✅ Components organized by domain (home/, projects/, blog/) instead of generic pages/ | | |

**Important distinction**: The client site has multiple separate pages (Servicios, Productos, Herramientas, Casos de Éxito) because they are different content types. The recruiter site has an **aggregated "Proyectos" view** via the `/api/projects` endpoint. This naturally leads to fewer pages and a more focused structure.

#### 3. **Hybrid: mirror top-level structure, organize pages by recruiter sections** (Recommended)

```
recruiter-site/src/
├── api/
│   └── client.ts
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Header.tsx         # Nav: Inicio, Proyectos, Blog, Contacto
│   │   └── Footer.tsx
│   ├── projects/              # Project-specific components
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectGrid.tsx
│   │   └── ProjectDetailModal.tsx
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   └── BlogPost.tsx
│   ├── home/                  # Home-specific components
│   │   ├── Hero.tsx
│   │   ├── ProfileToggle.tsx
│   │   ├── TechStack.tsx
│   │   └── RecentProjects.tsx
│   └── forms/
│       └── RecruiterContactForm.tsx
├── data/
│   └── stack.ts               # Static tech stack data
├── hooks/
│   ├── useProjects.ts
│   ├── useBlogPosts.ts
│   └── useContact.ts
├── pages/
│   ├── Home.tsx               # Multi-section scrollable home
│   ├── Projects.tsx           # Full project listing
│   ├── Blog.tsx               # Blog listing
│   ├── BlogPost.tsx           # Individual blog post (slug route)
│   └── Contact.tsx            # Contact page
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

| Pros | Cons | Effort |
|------|------|--------|
| ✅ Mirrors top-level client-site structure (api/, hooks/, pages/) | ❌ Still some divergence from client-site | Medium |
| ✅ Domain-organized components (projects/, blog/, home/) — cleaner than one big components/ | | |
| ✅ Fewer pages (5) vs client-site (7+), reflecting simpler navigation | | |
| ✅ Pages at root level (not nested) since fewer of them | | |

### Recommendation

**Approach 3 (Hybrid)** — Mirror client-site's top-level folder structure but organize components by domain. This gives:
1. **Consistency** with client-site at the architectural level (api/, hooks/, pages/)
2. **Purpose-built organization** for recruiter-specific components (home/, projects/, blog/)
3. **Simplicity** — fewer pages than client-site since projects are aggregated
4. **Reusability** — hooks pattern matches client-site exactly

The key architectural differences from client-site:
- **Home page is the main canvas**: Hero + Profile Toggle + Tech Stack carousel + Recent Projects carousel + CTA — all on one scrollable page
- **Projects are aggregated**: Uses `/api/projects` instead of separate entity pages
- **Project detail requires individual API calls**: The `/api/projects` endpoint returns summary-only. For full detail (including technicalExplanation/technicalImages), the project detail modal must fetch from individual endpoints (`/api/services/:slug`, `/api/products/:slug`, etc.) or the projects endpoint needs to be extended
- **Blog is read-only**: Only PUBLISHED posts, no admin actions
- **Contact form is simpler**: Uses `recruiterContactSchema` (no lastName, no source), posts to `/api/contact/recruiter`
- **Tech stack is static data**: Frontend/Backend/Complementary groups, stored as a TypeScript constant, no API needed
- **No authentication**: Completely public

### Specific Pages and Routes

| Route | Page Component | Features |
|-------|---------------|----------|
| `/` | Home | Hero, Profile Toggle, Tech Stack, Recent Projects (3), CTA |
| `/proyectos` | Projects | Full project listing, pagination, classification filter, type filter |
| `/proyectos/:slug` | Projects + ProjectDetailModal | Detail view with technicalExplanation, technicalImages |
| `/blog` | Blog | 3-column grid of PUBLISHED posts, pagination |
| `/blog/:slug` | BlogPost | Full blog post with body, media gallery, lessons learned |
| `/contacto` | Contact | Recruiter contact form + social links (WhatsApp, LinkedIn, GitHub, email) |
| `*` | NotFound | 404 page |

### Data Flow for Project Detail
1. User clicks project card → gets `ProjectSummary` from `/api/projects` response (has `id`, `type`, `slug`)
2. Modal opens → fetch detail from individual endpoint based on `type`:
   - `service` → `GET /api/services/${slug}`
   - `product` → `GET /api/products/${slug}`
   - `tool` → `GET /api/tools/${slug}`
   - `successCase` → `GET /api/success-cases/${slug}`
3. Detail response includes `technicalExplanation` and `technicalImages` (for service/product/tool)
4. Render Rich Text HTML sanitization for technicalExplanation

### Key Hooks Needed

```typescript
// useProjects.ts
useProjects(filter)            // GET /api/projects?page=&limit=&classification=&type=
useRecentProjects(limit=3)    // GET /api/projects/recent?limit=3
useProjectClassifications()   // GET /api/projects/classifications
useProjectBySlug(type, slug)  // Dynamic endpoint based on type

// useBlogPosts.ts
useBlogPosts(filter)          // GET /api/blog-posts?status=PUBLISHED&page=&limit=
useBlogPostBySlug(slug)       // GET /api/blog-posts/:slug

// useContact.ts
useSubmitRecruiterContact()   // POST /api/contact/recruiter
```

### Risks

- **Project detail data**: The `/api/projects` endpoint returns summary-only data. To show `technicalExplanation` and `technicalImages` in the project detail modal, the individual entity endpoints must be queried. This means the recruiter site needs access to `/api/services/:slug`, `/api/products/:slug`, `/api/tools/:slug`, `/api/success-cases/:slug` — all of which exist and are public.
- **Rich Text sanitization**: `technicalExplanation` stores Rich Text HTML. Must use `dompurify` or similar to sanitize before rendering in React to prevent XSS. Need to add `dompurify` to dependencies.
- **Blog post status filtering**: The `/api/blog-posts` endpoint's `findAll` controller may show ALL posts (including DRAFT). Need to verify the public route filters by `status=PUBLISHED` by default for the recruiter site. If not, the recruiter site must explicitly pass `?status=PUBLISHED`.
- **Responsive design**: The recruiter site needs a CV/portfolio layout which is different from the client site. Profile toggle, tech stack carousel, and project modals need careful responsive treatment.
- **Static vs dynamic content**: The hero photo, name, title, and personal bio are currently static in the plan. If these need to be dynamic later, an API endpoint would need to be added.
- **Tech Stack data**: Currently planned as static JSON. This is fine for v1 but may need an API endpoint in the future if the user wants to manage it from the admin panel.
- **No existing blog hooks in shared package**: Need to verify that `BlogPostResponse` type is correctly exported from `@jsoft/shared` — it is, via `packages/shared/src/types/index.ts`.

### Ready for Proposal
Yes — The exploration reveals a clear architecture. The API is fully ready for all recruiter site features. Key decisions to confirm:
1. **Approach**: Hybrid (mirror top-level structure, domain-organized components) — Recommended
2. **Project detail flow**: Use individual entity endpoints for full detail (technical fields)
3. **Tech stack**: Static data in TypeScript, or needs API endpoint?
4. **Hero content**: Static in code, or configurable via admin?
5. **Additional dependencies**: Add `dompurify` for HTML sanitization, and potentially `@types/dompurify`
