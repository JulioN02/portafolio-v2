# PortafolioV2JSS — Full System Architecture Analysis

> **Date**: May 19, 2026 | **Project**: Portafolio V2 — J Soft Solutions
> **Monorepo**: pnpm workspaces | **Node**: 20+ LTS | **DB**: PostgreSQL 15

---

## 1. System Overview

### Monorepo Structure

```
portafolio-v2/
├── api/                          # Express REST API (localhost:3000)
├── packages/
│   └── shared/                   # @jsoft/shared — Types, Zod schemas, API client, UI components
├── client-site/                  # Public client-facing SPA (localhost:5173)
├── recruiter-site/               # Public recruiter-facing SPA (localhost:5174)
├── admin-panel/                  # Admin back-office SPA (localhost:5175)
├── docs/                         # Plans, specs, analysis
├── openspec/                     # SDD artifacts (specs, changes, designs)
└── docker-compose.yml            # PostgreSQL 15 (port 5434:5432)
```

### Port Assignments

| App | Port | Type | Env Var (API URL) |
|-----|------|------|-------------------|
| API (Express) | `:3000` | Backend | — |
| Client Site | `:5173` | Vite SPA | `VITE_API_URL` |
| Admin Panel | `:5175` | Vite SPA | `VITE_API_URL` |
| Recruiter Site | `:5174` | Vite SPA | `VITE_API_URL` |

### Tech Stack per Package

| Layer | Tech | Notes |
|-------|------|-------|
| **API** | Express 4/5 + TypeScript + Prisma 5 + PostgreSQL 15 | JWT (jsonwebtoken) + bcrypt + Zod validation |
| **API Middleware** | cors + helmet + morgan + multer + dotenv | Cloudinary SDK available for production |
| **Shared** | Zod 3.x + TypeScript 5.x | Pure type/schema/lib package, no framework |
| **Frontends** | React 19 + Vite 5 + TypeScript 5 | CSS Modules, React Router v7 |
| **Data Fetching** | TanStack Query v5 | All three frontends use hooks pattern |
| **Admin Only** | axios (not shared createApiClient) + TipTap + jwt-decode | Custom axios client with interceptors |

### Dependencies Graph

```
                  ┌──────────────────────────────┐
                  │      PostgreSQL 15            │
                  │   (Docker: port 5434)         │
                  └──────────────┬───────────────┘
                                 │
                  ┌──────────────▼───────────────┐
                  │    API (Express + Prisma)    │
                  │    localhost:3000             │
                  │    Auth: JWT + bcrypt         │
                  └──┬───────────┬──────────┬────┘
                     │           │          │
            ┌────────▼──┐ ┌─────▼─────┐ ┌──▼──────────┐
            │ Client    │ │ Recruiter │ │ Admin Panel │
            │ Site      │ │ Site      │ │ (auth req)  │
            │ :5173     │ │ :5174     │ │ :5175       │
            │ public    │ │ public    │ │ CRUD + view │
            └───────────┘ └───────────┘ └─────────────┘
                     │           │          │
            ┌────────▼───────────▼──────────▼────┐
            │     @jsoft/shared (Zod + Types)    │
            │     + API Client + UI Components   │
            └────────────────────────────────────┘
```

---

## 2. Database Schema & Data Flow

### Models (7 entities)

**User** (Admin)
- `id`, `username` (unique), `password` (bcrypt), `createdAt`, `updatedAt`

**Service** (Content — Client + Recruiter)
- title, slug (unique), classification, shortDescription, fullDescription (Rich Text)
- includedItems (String[]), images (String[]), order, featured, deletedAt
- technicalExplanation?, technicalImages[] — for recruiter site detail

**Product** (Content — Client + Recruiter)
- Same pattern as Service + externalLink?
- technicalExplanation?, technicalImages[]

**Tool** (Content — Client + Recruiter)
- Same pattern as Product + requiresInstall (boolean)
- technicalExplanation?, technicalImages[]

**SuccessCase** (Content — Client + Recruiter)
- title, slug, description, images[], videos[], links[], deletedAt
- No featured/order fields

**BlogPost** (Content — Recruiter Site only)
- title, slug, category, shortDescription, coverImage, mediaGallery[]
- body (Rich Text), externalLink?, lessonsLearned?, status (PostStatus), deletedAt, publishedAt

**ContactForm** (Inbound messages)
- firstName, lastName?, whatsapp?, email, message, source, originType (FormOrigin)
- createdAt — indexed by originType

### Enums

| Enum | Values | Used By |
|------|--------|---------|
| `PostStatus` | DRAFT, PUBLISHED, PRIVATE, ARCHIVED | BlogPost |
| `FormOrigin` | CLIENT, RECRUITER | ContactForm |

### Key Indexes

- Service/Product/Tool: `@@index([featured, deletedAt])`, `@@index([order, createdAt])`
- BlogPost: `@@index([status, deletedAt])`, `@@index([publishedAt])`
- ContactForm: `@@index([originType, createdAt])`

### Data Flow Pattern

```
[DB] PostgreSQL
  → [ORM] Prisma Client
    → [Service Layer] Business logic + filtering (deletedAt: null)
      → [Controller Layer] Zod validation + orchestration
        → [Route Layer] Express router (public/protected)
          → [HTTP JSON] Response
            → [API Client] fetch/axios
              → [TanStack Query] Cache + state
                → [React Component] Render
```

Soft delete pattern: All content entities filter `WHERE deletedAt IS NULL` in every public query. The `findById` method is the only one that can find soft-deleted items (used for restore).

---

## 3. API Layer

### Endpoint Groups & Details

#### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | Public | Login, returns JWT + user |
| POST | `/api/auth/logout` | Protected | Logout (stateless, just confirms) |
| GET | `/api/auth/me` | Protected | Get current user info |

#### Services (`/api/services`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | List (paginated, filter by `featured`, `classification`) |
| GET | `/featured` | Public | Featured services (limit query param, default 3) |
| GET | `/classifications` | Public | All unique classifications |
| GET | `/:slug` | Public | Get by slug |
| GET | `/by-id/:id` | Public | Get by ID |
| POST | `/` | Protected | Create |
| PUT | `/:id` | Protected | Update |
| DELETE | `/:id` | Protected | Soft delete |
| PATCH | `/:id/restore` | Protected | Restore soft-deleted |
| PATCH | `/:id/reorder` | Protected | Set order value |

#### Products (`/api/products`) — Identical pattern to Services
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | List (paginated, filter by `featured`, `classification`) |
| GET | `/featured` | Public | Featured |
| GET | `/classifications` | Public | All unique classifications |
| GET | `/:slug` | Public | By slug |
| GET | `/by-id/:id` | Public | By ID |
| POST | `/` | Protected | Create |
| PUT | `/:id` | Protected | Update |
| DELETE | `/:id` | Protected | Soft delete |
| PATCH | `/:id/restore` | Protected | Restore |
| PATCH | `/:id/reorder` | Protected | Reorder |

#### Tools (`/api/tools`) — Identical pattern
Same as Products (10 endpoints)

#### SuccessCases (`/api/success-cases`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | List (paginated) |
| GET | `/recent` | Public | Recent (limit, default 3) |
| GET | `/:slug` | Public | By slug |
| GET | `/by-id/:id` | Public | By ID |
| POST | `/` | Protected | Create |
| PUT | `/:id` | Protected | Update |
| DELETE | `/:id` | Protected | Soft delete |
| PATCH | `/:id/restore` | Protected | Restore |

Note: No `featured`, `classifications`, or `reorder` endpoints (schema has no order/featured fields).

#### BlogPosts (`/api/blog-posts`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | List (paginated, filter by `status`, `category`) |
| GET | `/categories` | Public | All unique categories |
| GET | `/:slug` | Public | By slug |
| GET | `/by-id/:id` | Public | By ID |
| POST | `/` | Protected | Create |
| PUT | `/:id` | Protected | Update |
| DELETE | `/:id` | Protected | Soft delete |
| PATCH | `/:id/restore` | Protected | Restore |
| PATCH | `/:id/reorder` | Protected | Reorder (no-op — BlogPost has no `order` field) |
| PATCH | `/:id/status` | Protected | Change status + sets publishedAt on PUBLISHED |

#### Contact (`/api/contact`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/client` | Public | Submit client contact (originType=CLIENT) |
| POST | `/recruiter` | Public | Submit recruiter contact (originType=RECRUITER) |
| GET | `/` | Protected | List all (paginated, filter by `originType`) |
| GET | `/stats/summary` | Protected | Stats (total, clientCount, recruiterCount, recentCount) |
| GET | `/:id` | Protected | Get by ID |
| DELETE | `/:id` | Protected | Delete |

*Important*: The client-contact schema includes `source` (e.g., "service:Desarrollo Web"), while recruiter-contact does not (source is hardcoded to "recruiter").

#### Projects (`/api/projects`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | Aggregated list (Services + Products + Tools + SuccessCases) |
| GET | `/recent` | Public | Recent N (default 3) |
| GET | `/classifications` | Public | All unique classifications across all entity types |

Projects is an **aggregation layer** — it queries all 4 content tables in parallel, merges results, sorts by `createdAt`, and applies pagination in-memory.

#### Upload (`/api/upload`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Protected | Upload file (multipart, max 5MB, images only) |
| DELETE | `/:filename` | Protected | Delete file |

All routes behind `authMiddleware`. Uses Multer with memory storage. Dev saves to local `uploads/` directory.

### Auth Flow (JWT)

```
POST /api/auth/login { username, password }
  → bcrypt.compare(password, hash)
  → jwt.sign({ userId, username, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '7d' })
  → Response { token, user: { id, username, role } }

Protected routes:
  authMiddleware extracts Bearer token → jwt.verify → sets req.user
  401 if missing/expired/invalid
```

---

## 4. Admin Panel (Back-office)

### Tech Stack
- React 19 + Vite 5 + TypeScript 5
- **axios** (NOT the shared `createApiClient` — custom axios with interceptors)
- React Router v7 (BrowserRouter, not createBrowserRouter)
- TanStack Query v5
- TipTap (blog post rich text editor)
- jwt-decode (JWT payload decoding)
- CSS Modules (from @jsoft/shared variables)

### Routes Structure

| Path | Component | Auth |
|------|-----------|------|
| `/login` | LoginPage | Public |
| `/dashboard` | DashboardPage | ProtectedLayout |
| `/services` | ServicesListPage | ProtectedLayout |
| `/services/create` | ServiceCreatePage | ProtectedLayout |
| `/services/edit/:id` | ServiceEditPage | ProtectedLayout |
| `/products` | ProductsListPage | ProtectedLayout |
| `/products/create` | ProductCreatePage | ProtectedLayout |
| `/products/edit/:id` | ProductEditPage | ProtectedLayout |
| `/tools` | ToolsListPage | ProtectedLayout |
| `/tools/create` | ToolCreatePage | ProtectedLayout |
| `/tools/edit/:id` | ToolEditPage | ProtectedLayout |
| `/success-cases` | SuccessCasesListPage | ProtectedLayout |
| `/success-cases/create` | SuccessCaseCreatePage | ProtectedLayout |
| `/success-cases/edit/:id` | SuccessCaseEditPage | ProtectedLayout |
| `/blog-posts` | BlogPostsListPage | ProtectedLayout |
| `/blog-posts/create` | BlogPostCreatePage | ProtectedLayout |
| `/blog-posts/edit/:id` | BlogPostEditPage | ProtectedLayout |
| `/contact-messages` | ContactMessagesListPage | ProtectedLayout |
| `/contact-messages/:id` | ContactMessageDetailPage | ProtectedLayout |
| `/settings` | SettingsLayout (redirect) | ProtectedLayout |
| `/settings/profile` | SettingsPage | ProtectedLayout |
| `/settings/preferences` | SettingsPage | ProtectedLayout |
| `/pages` | PagesListPage | ProtectedLayout |

### Auth Architecture

```
ProtectedLayout
  → Check `authApi.isAuthenticated()` (localStorage has 'admin_token')
  → If no token → <Navigate to="/login" />
  → If has token → <DashboardLayout>{children}</DashboardLayout>

LoginPage → LoginForm
  → authApi.login(credentials) → POST /api/auth/login
  → Store token in localStorage key 'admin_token'
  → On success: redirect to /dashboard
  → On error: show error message

Logout
  → Clear localStorage 'admin_token'
  → window.location.href = '/login'

401 Interceptor (axios response interceptor)
  → If response.status === 401 → clear token → redirect to /login
```

### Dashboard (SummaryCards)
- Renders 6 cards showing counts: Services, Products, Tools, SuccessCases, BlogPosts, ContactMessages
- Uses TanStack Query hooks for each entity count
- `SummaryCard` component: title, value, icon, color

### CRUD Pattern (applied to all 5 content entities)
Each entity has:
1. **List page**: Paginated table, action buttons (edit/delete), optional filters
2. **Create page**: Form with Zod validation from `@jsoft/shared`
3. **Edit page**: Pre-filled form, PUT on submit
4. **Delete**: Soft delete with confirmation

### Contact Messages
- Read-only list (no CRUD, just view)
- Detail view by ID (`/contact-messages/:id`)
- Filter by originType (CLIENT / RECRUITER)

### Settings & Pages
- `/settings` has sub-routes: profile, preferences (same page component)
- `/pages` is a separate pages list (purpose unclear from code alone)

### API Layer Files
Uses **axios** (NOT `createApiClient` from shared):
```
admin-panel/src/api/
├── client.ts           # axios.create() + interceptors
├── auth.ts             # login, logout, getCurrentUser, jwtDecode
├── services.api.ts
├── products.api.ts
├── tools.api.ts
├── successCases.api.ts
├── blogPosts.api.ts
└── contactForms.api.ts
```

### Hooks (TanStack Query)
```
admin-panel/src/hooks/
├── useAuth.ts          # login, logout, getUser, isAuthenticated
├── useServices.ts      # CRUD hooks
├── useProducts.ts      # CRUD hooks
├── useTools.ts         # CRUD hooks
├── useSuccessCases.ts  # CRUD hooks
├── useBlogPosts.ts     # CRUD hooks + TipTap
├── useContactForms.ts  # Read-only hook
└── useSiteSections.ts  # Site sections management
```

---

## 5. Client Site (Public — Client Facing)

### Tech Stack
- React 19 + Vite 5 + TypeScript 5
- `createApiClient` from `@jsoft/shared` (fetch-based)
- React Router v7 (Routes/Route)
- TanStack Query v5
- CSS Modules (from @jsoft/shared variables)

### Routes (Spanish paths)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | HomePage | Hero + Servicios Destacados + About |
| `/servicios` | ServicesPage | Full service listing with pagination |
| `/servicios/:slug` | ServiceDetailPage | Service detail inline/modal |
| `/productos` | ProductsPage | Product catalog |
| `/productos/:slug` | ProductsPage (same) | Product detail |
| `/herramientas` | ToolsPage | Tool gallery |
| `/herramientas/:slug` | ToolsPage (same) | Tool detail |
| `/casos-de-exito` | SuccessCasesPage | Success story gallery |
| `/casos-de-exito/:slug` | SuccessCasesPage (same) | Success story detail |
| `/contacto` | ContactPage | Contact form + social links |
| `/404` | NotFoundPage | 404 |
| `*` | → `/404` | Catch-all redirect |

### Key Features
- Public-facing site for **potential clients** (B2B)
- Content displayed: Services, Products, Tools, SuccessCases (all 4 content types)
- Contact form uses `clientContactSchema` → POST `/api/contact/client`
- Contact source is auto-set (e.g., "service:Desarrollo Web")
- `originType=CLIENT` on contact submissions
- Spanish UI (servicios, productos, herramientas, casos-de-exito, contacto)

### Architecture Note
- `client-site/src/pages/` organized by route: `Home/`, `Services/`, `Products/`, `Tools/`, `SuccessCases/`, `Contact/`, `NotFound/`
- Uses Embla carousel (unlike admin which doesn't have carousels)
- Loading states with TanStack Query's built-in loading/error states

---

## 6. Recruiter Site (Public — Recruiter Facing)

### Tech Stack
- React 19 + Vite 5 + TypeScript 5
- `createApiClient` from `@jsoft/shared` (fetch-based)
- React Router v7 (Routes/Route)
- TanStack Query v5
- Embla Carousel (same as client-site)
- DOMPurify (HTML sanitization for technicalExplanation and blog body)
- CSS Modules (from @jsoft/shared variables)

### Routes (Spanish paths)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | HomePage | Hero + ProfileToggle + TechStack + RecentProjects |
| `/proyectos` | ProjectsPage | Project listing + filters + pagination + detail modal |
| `/blog` | BlogPage | Blog grid (3-col, PUBLISHED only) |
| `/blog/:slug` | BlogPostPage | Blog post detail with body + lessons |
| `/contacto` | ContactPage | Recruiter contact form + social links |
| `*` | NotFoundPage | Catch-all 404 |

### Key Features
- Public-facing for **recruiters/employers** (technical hiring)
- **Home page sections**: Hero + ProfileToggle (Profesional/Técnico), TechStack carousel (static data, 3 groups: Frontend, Backend, Complementary), RecentProjects carousel (API)
- **Projects page**: Aggregated project listing from `/api/projects`, filters (type + classification), pagination, detail **modal** (not separate page) that fetches individual entity endpoint for `technicalExplanation` + `technicalImages` + DOMPurify sanitization
- **Blog page**: Only PUBLISHED posts, 3-column grid, individual post page with full body (DOMPurify'd), lessonsLearned, externalLink
- **Contact page**: Form with `recruiterContactSchema` → POST `/api/contact/recruiter` with hardcoded `originType=RECRUITER` + extra fields (company, position, budget, preferredContact) encoded into message body
- **Static data**: Tech stack is TypeScript data (`data/tech-stack.ts`), profile text is static

### Architecture Note
- Uses `createApiClient` from shared (no auth)
- Project detail via **modal** (preserves scroll/filter/pagination state)
- DOMPurify used in 3 places: ProjectDetailModal (technicalExplanation), BlogPostPage (body + lessonsLearned)
- Hooks: `useProjects`, `useRecentProjects`, `useProjectClassifications`, `useProjectDetail`, `useBlogPosts`, `useBlogPostBySlug`, `useSubmitContact`

---

## 7. Coexistence Model: Client vs Recruiter

### Shared Layers
| Layer | Details |
|-------|---------|
| **API** | Same Express server, same routes |
| **Database** | Same PostgreSQL, same Prisma schema |
| **Auth System** | Same JWT + bcrypt (for admin admin-panel) |
| **@jsoft/shared** | Same Zod schemas, types, API client, UI components, CSS variables |
| **Data Fetching Pattern** | Both use TanStack Query v5 with similar hook patterns |
| **HTTP Client** | Both use `createApiClient` from shared (admin uses axios instead) |
| **Hosting** | Both deployed as Vite static sites |

### Differences

| Aspect | Client Site | Recruiter Site |
|--------|-------------|----------------|
| **Audience** | Business clients (B2B) | Recruiters/employers |
| **Contact Origin** | `originType=CLIENT` | `originType=RECRUITER` |
| **Contact Schema** | `clientContactSchema` (firstName, lastName, whatsapp, email, message, source) | `recruiterContactSchema` (firstName, email, whatsapp?, message) |
| **Content Focus** | Services, Products, Tools featured on Home | Projects aggregate + tech stack |
| **Blog** | ❌ Not shown | ✅ Full blog (grid + detail) |
| **Tech Stack** | ❌ Not shown | ✅ Carousel (static data) |
| **Profile Toggle** | ❌ Not applicable | ✅ Profesional/Técnico |
| **Content Detail** | Simple description + gallery | Technical explanation + technical images |
| **Navigation** | Servicios, Productos, Herramientas, Casos de Éxito, Contacto | Inicio, Proyectos, Blog, Contacto |
| **UI Language** | Spanish (client-facing) | Spanish (recruiter-facing) |
| **Project Display** | Separate pages per entity type | Unified "Proyectos" page |
| **HTML Sanitization** | None needed (no raw HTML displayed) | DOMPurify on technicalExplanation + blog body |

### Shared vs Separate URLs

Both are **separate SPA deployments** — they exist as independent Vite apps at different domains/subdomains:
- `client-site/` → `clients.midominio.com` (or similar)
- `recruiter-site/` → `midominio.com` (or similar)

They share **no React components** between them. Each has its own `components/` directory with duplicated patterns.

### Content Visibility Matrix

| Content Type | Client Site | Recruiter Site |
|-------------|-------------|----------------|
| Services (featured) | ✅ Home carousel | ✅ Projects (aggregated) |
| Services (detail) | ✅ /servicios/:slug | ✅ Project modal (technicalExplanation) |
| Products | ✅ /productos | ✅ Projects (aggregated) |
| Tools | ✅ /herramientas | ✅ Projects (aggregated) |
| SuccessCases | ✅ /casos-de-exito | ✅ Projects (aggregated) |
| BlogPosts | ❌ | ✅ /blog + /blog/:slug |
| Contact CLIENT | ✅ → admin inbox | ❌ |
| Contact RECRUITER | ❌ | ✅ → admin inbox |

---

## 8. Key Workflows

### Content Management Flow
```
Admin Panel (create/edit/delete)
  → PUT/POST/DELETE /api/{entity} (auth required)
    → Zod validation in controller
      → Prisma CRUD in service layer
        → PostgreSQL (soft delete: sets deletedAt)

Admin publishes content
  → Status changed to PUBLISHED or featured set to true
    → Immediately visible on public sites (no cache invalidation needed)

Public sites query
  → GET /api/services?featured=true (for home page carousels)
  → GET /api/services (paginated lists)
  → GET /api/services/:slug (detail views)
    → Always filtered: deletedAt IS NULL
```

### Contact Flow
```
User (Client/Recruiter) fills form
  → Zod validation on frontend (shared schema)
    → POST /api/contact/client or /api/contact/recruiter
      → Zod validation on backend (shared schema)
        → Prisma create ContactForm with originType & source
          → Stored in PostgreSQL

Admin sees contact
  → GET /api/contact (auth required, filter by originType)
    → ContactMessagesListPage or ContactMessageDetailPage
      → Read-only view (no reply system built)
```

### Blog Flow
```
Admin creates blog post (default status: DRAFT)
  → POST /api/blog-posts (auth required)
    → TipTap rich text → HTML stored in body field

Admin changes status to PUBLISHED
  → PATCH /api/blog-posts/:id/status { status: 'PUBLISHED' }
    → Sets publishedAt timestamp
    
Recruiter Site queries
  → GET /api/blog-posts?status=PUBLISHED
    → Blog grid displays cards (coverImage, title, excerpt, category, date)
  → GET /api/blog-posts/:slug
    → Blog post detail page (DOMPurify + dangerouslySetInnerHTML)
```

### Project Display Flow (Recruiter Site)
```
GET /api/projects?classification=X&type=Y&page=1
  → [Service, Product, Tool, SuccessCase] tables queried in parallel
    → Results merged, sorted by createdAt DESC
      → Paginated in-memory (slice)
        → JSON response { data: ProjectSummary[], pagination: {...} }

User clicks project card → Modal opens
  → GET /api/{services|products|tools|success-cases}/{slug}
    → Full entity data including technicalExplanation & technicalImages
      → DOMPurify sanitize → dangerouslySetInnerHTML in modal
```

### Auth Flow (Admin Panel)
```
User visits protected route (/dashboard, /services, etc.)
  → ProtectedLayout checks localStorage 'admin_token'
    → No token → Navigate to /login
    → Has token → Render DashboardLayout + page component

Login form → POST /api/auth/login
  → JWT returned → stored in localStorage 'admin_token'
    → Redirect to /dashboard

Any API call with expired/invalid token
  → Axios response interceptor catches 401
    → Clear token → window.location.href = '/login'
```

---

## 9. Shared vs Frontend-Specific Logic

### What Lives in `@jsoft/shared`

| Category | Contents |
|----------|----------|
| **Zod Schemas** | service.schema, product.schema, tool.schema, successCase.schema, blogPost.schema, contact.schema, login.schema |
| **TypeScript Types** | All `*Input`, `*UpdateInput`, `*FilterInput`, `*Response`, `PostStatus`, `FormOrigin`, `LoginInput`, `JwtPayload`, `LoginResponse`, `PaginationParams`, `PaginatedResponse`, `ApiError`, `ApiSuccess` |
| **API Client** | `createApiClient()` — fetch-based with JWT support, 401 handler, query params |
| **UI Components** | Button, Input, Card, Loading, ErrorMessage, Modal, ProtectedRoute |
| **CSS Variables** | `variables.css` with design tokens |

### What's Duplicated Across Frontends

| Pattern | Duplicated In |
|---------|--------------|
| API Client setup | `client-site/src/api/client.ts`, `recruiter-site/src/api/client.ts` |
| TanStack Query hooks per entity | Each frontend has its own `hooks/` with entity-specific hooks |
| Layout components | Each has `Layout.tsx` Header/Footer with their own nav |
| Page components | Totally separate per frontend |
| CSS Modules | Each frontend has its own `.module.css` files |
| Embla Carousel | `client-site` and `recruiter-site` both have carousel components |
| Loading/error states | Implemented per-page (not shared) |
| Pagination components | Implemented per-frontend |

### Key Divergence: API Client

- **Client Site & Recruiter Site**: Use `createApiClient()` from `@jsoft/shared` (fetch-based, no axios dependency)
- **Admin Panel**: Uses **axios** directly (`api/client.ts` creates `axios.create()` + interceptors). This means:
  - Admin has a different HTTP client than the public sites
  - Shared `createApiClient` is NOT used by admin
  - Admin has axios as a dependency, public sites don't

### CSS Architecture
- Shared: `packages/shared/src/styles/variables.css` — color tokens, spacing, typography
- Each frontend: imports `variables.css`, adds its own `globals.css`/`index.css` for resets and base styles
- Component styles: CSS Modules (`.module.css`) scoped per component

---

## 10. Current State & Gaps

### What's Implemented ✅

**API (Complete)**
- All 9 route groups implemented (auth, services, products, tools, successCases, projects, upload, contact, blogPosts)
- All CRUD operations per entity (create, read, update, soft delete, restore, reorder)
- Zod validation in all controllers
- JWT auth middleware
- File upload with Multer
- Projects aggregation endpoint
- Contact form stats endpoint
- Blog post status management

**Admin Panel (Complete)**
- Login with JWT auth
- Dashboard with summary cards
- CRUD for Services, Products, Tools, SuccessCases, BlogPosts
- Contact messages read-only list + detail
- Settings page
- Pages list
- ProtectedLayout with auth guard
- DashboardLayout with Sidebar + Header
- TipTap editor for BlogPosts

**Client Site (Complete)**
- Home, Services, Products, Tools, SuccessCases, Contact pages
- TanStack Query hooks for all entities
- Featured services/products/tools on home
- Contact form → POST /api/contact/client

**Recruiter Site (Complete)**
- Home with Hero + ProfileToggle + TechStack + RecentProjects
- Projects listing with filters + pagination + detail modal
- Blog grid + detail
- Contact form → POST /api/contact/recruiter
- DOMPurify HTML sanitization
- Embla carousels

### What's Planned But Not Yet Implemented 🔲

From `DEVELOPMENT_PLAN.md`:

| Feature | Phase | Status |
|---------|-------|--------|
| OpenAPI Contract (Swagger) | F0/F1 | ❌ Not created |
| Tests (unit/integration) | F1+ | ❌ `api/src/__tests__/` exists but may be empty |
| Cloudinary integration (production upload) | F1/F7 | ❌ Dev only (local uploads/) |
| Railway deploy configuration | F0/F7 | ❌ Not configured |
| SEO meta tags (client + recruiter) | F7 | ❌ Not implemented |
| Responsive polish (375px, 768px, 1440px) | F7 | ❌ Not verified |
| Lighthouse performance optimization | F7 | ❌ Not done |
| OWASP security review | F7 | ❌ Not done |
| Zero console errors | F7 | ❌ Not verified |
| Final README with deploy instructions | F7 | ❌ Not done |
| Rich text sanitization (DOMPurify) on client-site | F7 | ❌ Not needed currently (no HTML rendering) |
| HTTP-only cookie auth for admin | Out of scope | Deliberate choice |

### Known Issues & Observations 🟡

1. **API Client Fragmentation**: Admin uses axios, public sites use shared `createApiClient`. This means:
   - The 401 interceptor logic is duplicated
   - Any enhancement to `createApiClient` doesn't benefit admin
   - Admin has an extra dependency (axios + jwt-decode)

2. **BlogPost `reorder` endpoint is a no-op**: The route exists (`PATCH /api/blog-posts/:id/reorder`) but the service just returns the current record without updating anything, because the BlogPost Prisma model has no `order` field.

3. **Contact Form Extra Fields**: The recruiter-site's `useContactForm.ts` defines extra fields (company, position, budget, preferredContact) that don't exist in `recruiterContactSchema`. These are encoded into the message body as a workaround. This means structured data is lost in a text field.

4. **SuccessCase Aggregation in Projects**: The `projectsService` treats SuccessCase's description as shortDescription and uses a fake classification `'success-case'`. It also has no `featured` field, so it defaults to `false`.

5. **In-Memory Pagination**: The `/api/projects` aggregate endpoint loads ALL records from all 4 tables, merges them, sorts by date, then paginates in-memory. This won't scale well with hundreds of items.

6. **App.tsx Discrepancy**: The proposal/design documents reference React Router v7's `createBrowserRouter`, but the actual implementation uses the simpler `BrowserRouter` + `Routes` + `Route` pattern (in admin panel's `AppRoutes.tsx` and the other frontends' `App.tsx`).

7. **Client-site Uses Axios?**: Checking the actual code, `client-site/src/api/client.ts` uses `createApiClient` from shared (not axios). But the original user's issue asked about axios in admin-panel — this is confirmed: admin-panel uses axios, the other two don't.

8. **No Tests**: The `api/src/__tests__/` directory exists but is empty. There are no unit or integration tests.

9. **Empty `utils/` and `types/` in API**: `api/src/utils/` and `api/src/types/` are empty directories, suggesting planned helpers/types that were never created.

10. **Empty `pages/` directory in admin**: There's a `pages/pages/` directory (nested) — the `PagesListPage` component seems to be a feature for managing static pages, but its purpose is unclear.

---

## Appendix: Complete API Endpoint Inventory

| # | Method | Path | Auth | Entity |
|---|--------|------|------|--------|
| 1 | POST | /api/auth/login | Public | Auth |
| 2 | POST | /api/auth/logout | Protected | Auth |
| 3 | GET | /api/auth/me | Protected | Auth |
| 4 | GET | /api/services | Public | Service |
| 5 | GET | /api/services/featured | Public | Service |
| 6 | GET | /api/services/classifications | Public | Service |
| 7 | GET | /api/services/:slug | Public | Service |
| 8 | GET | /api/services/by-id/:id | Public | Service |
| 9 | POST | /api/services | Protected | Service |
| 10 | PUT | /api/services/:id | Protected | Service |
| 11 | DELETE | /api/services/:id | Protected | Service |
| 12 | PATCH | /api/services/:id/restore | Protected | Service |
| 13 | PATCH | /api/services/:id/reorder | Protected | Service |
| 14 | GET | /api/products | Public | Product |
| 15 | GET | /api/products/featured | Public | Product |
| 16 | GET | /api/products/classifications | Public | Product |
| 17 | GET | /api/products/:slug | Public | Product |
| 18 | GET | /api/products/by-id/:id | Public | Product |
| 19 | POST | /api/products | Protected | Product |
| 20 | PUT | /api/products/:id | Protected | Product |
| 21 | DELETE | /api/products/:id | Protected | Product |
| 22 | PATCH | /api/products/:id/restore | Protected | Product |
| 23 | PATCH | /api/products/:id/reorder | Protected | Product |
| 24 | GET | /api/tools | Public | Tool |
| 25 | GET | /api/tools/featured | Public | Tool |
| 26 | GET | /api/tools/classifications | Public | Tool |
| 27 | GET | /api/tools/:slug | Public | Tool |
| 28 | GET | /api/tools/by-id/:id | Public | Tool |
| 29 | POST | /api/tools | Protected | Tool |
| 30 | PUT | /api/tools/:id | Protected | Tool |
| 31 | DELETE | /api/tools/:id | Protected | Tool |
| 32 | PATCH | /api/tools/:id/restore | Protected | Tool |
| 33 | PATCH | /api/tools/:id/reorder | Protected | Tool |
| 34 | GET | /api/success-cases | Public | SuccessCase |
| 35 | GET | /api/success-cases/recent | Public | SuccessCase |
| 36 | GET | /api/success-cases/:slug | Public | SuccessCase |
| 37 | GET | /api/success-cases/by-id/:id | Public | SuccessCase |
| 38 | POST | /api/success-cases | Protected | SuccessCase |
| 39 | PUT | /api/success-cases/:id | Protected | SuccessCase |
| 40 | DELETE | /api/success-cases/:id | Protected | SuccessCase |
| 41 | PATCH | /api/success-cases/:id/restore | Protected | SuccessCase |
| 42 | GET | /api/blog-posts | Public | BlogPost |
| 43 | GET | /api/blog-posts/categories | Public | BlogPost |
| 44 | GET | /api/blog-posts/:slug | Public | BlogPost |
| 45 | GET | /api/blog-posts/by-id/:id | Public | BlogPost |
| 46 | POST | /api/blog-posts | Protected | BlogPost |
| 47 | PUT | /api/blog-posts/:id | Protected | BlogPost |
| 48 | DELETE | /api/blog-posts/:id | Protected | BlogPost |
| 49 | PATCH | /api/blog-posts/:id/restore | Protected | BlogPost |
| 50 | PATCH | /api/blog-posts/:id/reorder | Protected | BlogPost |
| 51 | PATCH | /api/blog-posts/:id/status | Protected | BlogPost |
| 52 | POST | /api/contact/client | Public | Contact |
| 53 | POST | /api/contact/recruiter | Public | Contact |
| 54 | GET | /api/contact | Protected | Contact |
| 55 | GET | /api/contact/stats/summary | Protected | Contact |
| 56 | GET | /api/contact/:id | Protected | Contact |
| 57 | DELETE | /api/contact/:id | Protected | Contact |
| 58 | GET | /api/projects | Public | Projects |
| 59 | GET | /api/projects/recent | Public | Projects |
| 60 | GET | /api/projects/classifications | Public | Projects |
| 61 | POST | /api/upload | Protected | Upload |
| 62 | DELETE | /api/upload/:filename | Protected | Upload |
| — | GET | /api/health | Public | Health |

**Total: 62 endpoints** (including 1 health check)
