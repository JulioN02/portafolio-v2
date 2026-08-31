# Design: Project Publications

## Overview

Adds a real `Project` entity (practice projects) with full chain shared→api→admin→client, dynamic tags across BlogPost+Project, a shared TipTap editor with inline Image/Video nodes, sandboxed HTML/CSS/JS simulators, upload hardening, and a status-leak-free recruiter aggregation. Four shippable phases; ordering per phase: shared Zod → api (strict TDD) → frontends, with a typecheck gate per phase (`pnpm -r run typecheck`).

## Technical Approach

Bottom-up per phase, mirroring archived-change patterns (`blog-post.service.ts`, `service.controller.ts`, TanStack hooks). Reuses the existing `PostStatus` enum, `deletedAt` soft-delete, `publishedAt` auto-set on PUBLISHED, and the routes→controllers→services→Prisma layering. Rich text stays HTML (TipTap `getHTML`), sanitized on render with a media allowlist; simulators bypass DOMPurify entirely and are contained by the sandbox.

---

## Architecture Decisions

### Decision 1: Aggregation moves to `/api/portfolio/projects` (frees `/api/projects` for CRUD)
**Choice**: The recruiter aggregation (list/recent/classifications) relocates from `/api/projects` to `/api/portfolio/projects*`. Project CRUD owns `/api/projects`.
**Alternatives**: (a) Keep aggregation at `/api/projects` and mount CRUD elsewhere — rejected: `GET /api/projects/recent` and `/classifications` would shadow `GET /api/projects/:slug`; CRUD is the canonical entity resource and must own the entity name. (b) Version the aggregation (`/api/v1/projects`) — rejected: no versioning exists in the API and the aggregation is a derived recruiter view, not a first-class resource.
**Rationale**: Specs (projects + recruiter-projects) explicitly require freeing the namespace; REST convention favors the entity resource at `/api/projects`. "Portfolio" is the existing conceptual grouping on the recruiter site.
**Migration**: `recruiter-site/src/hooks/useProjects.ts` base paths change (`/projects`→`/portfolio/projects`, `/projects/recent`→`/portfolio/projects/recent`, `/projects/classifications`→`/portfolio/projects/classifications`). Callers (`ProjectList.tsx`, `RecentProjects.tsx`, `ProjectDetailModal.tsx`) need no logic change — only the hook internals. Old paths are removed (no external consumers; single-tenant API).

### Decision 2: Simulator metadata = dedicated `Simulator` model + private bucket + server-streamed content
**Choice**: New Prisma `Simulator` model (id, title, slug unique, fileName, size, mimeType, width?, height?, uploadedAt, timestamps, deletedAt). Files live in the `simulators` Supabase bucket as **private** objects; the serving endpoint streams them server-side.
**Alternatives**: (a) Store HTML as a text blob in Postgres — rejected: files can be large (up to 1MB), blob storage bloats the DB and complicates size checks; object storage is already the established pattern. (b) Public bucket + direct URL — rejected (security): a public `text/html` object would serve raw HTML from the bucket origin with no CSP/sandbox headers; server-side streaming lets the API own the security headers.
**Rationale**: Meets spec (id, title, file url, size) and the "dedicated serving endpoint with CSP sandbox headers" requirement. `slug` gives stable embed references for the editor node (Phase 4); `width`/`height` satisfy dimension limits with per-simulator overrides.
**Upload constraints**: multer `limits.fileSize = 1 * 1024 * 1024`; fileFilter accepts only `.html` + `text/html`; `bucket` is forced to `simulators` server-side (never client-chosen) and validated against the allowlist.

### Decision 3: SVG accept aligned to server; sanitized-SVG path deferred
**Choice**: `ImageUploader` `DEFAULT_ACCEPT` becomes `image/jpeg,image/png,image/gif,image/webp` (no SVG). Server behavior unchanged (SVG → 400 with XSS-safety message).
**Alternatives**: (a) Enable sanitized SVG server-side (svgo/sanitize-svg + correct `image/svg+xml` content-type) — **deferred** (out of scope this change): requires a sanitization pipeline, serving-content-type audit, and CSP review for active content. (b) Keep advertising SVG and reject at upload — rejected: confusing UX the spec explicitly forbids.
**Rationale**: Upload-hardening spec requires client accept to match server capabilities exactly.

### Decision 4: Lab blog posts → type `laboratorio`; detail opens the blog page, not the modal
**Choice**: Aggregation renders blog posts tagged `laboratorio` OR `experimento` as `type: 'laboratorio'`; `articulo` excluded. Cards of type `laboratorio` navigate to `/blog/:slug` (existing recruiter `BlogPostPage`) instead of opening the detail modal.
**Alternatives**: Fetch `/api/blog-posts/:slug` inside the modal — rejected: blog rendering (body + lessonsLearned) already exists as a dedicated page; duplicating it in a modal adds a second rendering path for the same content.
**Rationale**: The spec's modal scenarios cover service/product/tool/project only; navigation for lab posts preserves existing blog UX and keeps `ProjectDetailModal` scoped to entity detail endpoints.
**Real Project rows**: `type: 'project'`, tags exposed for the classification filter, detail via `GET /api/projects/:slug` (add `project: '/projects'` to `detailEndpointMap`).

### Decision 5: Shared DOMPurify media allowlist + restricted iframe src
**Choice**: `@jsoft/shared` exports `sanitizeHtml(html, { allowMedia })` — a DOMPurify wrapper whose `ADD_TAGS`/`ADD_ATTR` allow `img`, `video`, `source`, `figure`, `figcaption`, and `iframe` **only when** `src` matches the simulator endpoint regex (`^/api/simulators/[A-Za-z0-9]+/content$`); scripts/objects remain stripped.
**Alternatives**: Per-frontend DOMPurify configs — rejected: three renderers (client, recruiter, admin previews later) must stay in lockstep; one shared util prevents allowlist drift.
**Rationale**: Sanitization delta requires every `dangerouslySetInnerHTML` to use the media allowlist; centralizing it makes the verify-phase assertion ("iframe to any other origin stripped") single-source.

### Decision 6: Simulator content endpoint overrides helmet for that response
**Choice**: `GET /api/simulators/:id/content` sets its own headers: `Content-Type: text/html`, `Content-Security-Policy: sandbox allow-scripts; frame-ancestors <frontend origins>; default-src 'none'; base-uri 'none'; form-action 'none'`, `X-Content-Type-Options: nosniff`, `Cache-Control: no-store`; it removes helmet's `X-Frame-Options` for that response.
**Alternatives**: Leave helmet defaults — rejected: `frame-ancestors 'self'` + `X-Frame-Options: SAMEORIGIN` would **block** cross-origin frontends (client/recruiter/admin) from framing the simulator.
**Rationale**: Defense in depth: the iframe `sandbox="allow-scripts"` attribute (no `allow-same-origin`) plus the CSP `sandbox allow-scripts` directive on the served document. `frame-ancestors` derives from the configured `CORS_ORIGIN` list so embeds keep working.

### Decision 7: Tags are free-form, validated in shared; category stays derived
**Choice**: `tags String[]` on `Project` and `BlogPost`; a shared `tagsSchema` (array of trimmed strings, 1–30 chars, max 10) reused by both entity schemas. BlogPost `category` remains a column, derived from the first tag on write (backwards compatible).
**Alternatives**: A closed tag enum — rejected by spec (dynamic, no hardcoded list). Removing `category` — rejected: API/recruiter compat requires it.
**Rationale**: blog-tags spec (free entry + suggestions from `/tags` endpoints) requires dynamic storage; deriving `category` keeps existing consumers working.

---

## Data Flow

### Project publish flow
```
Admin ProjectForm → useCreateProject (mutation) → POST /api/projects
  → controller (projectSchema) → project.service.create (sets publishedAt if PUBLISHED) → Prisma
Client /proyectos → useProjects → GET /api/projects?tag=&search=&page=
  → project.service.findAll (status=PUBLISHED, deletedAt=null) → Prisma
```

### Recruiter aggregation flow
```
Recruiter ProjectList → useProjects → GET /api/portfolio/projects?classification=&page=
  → portfolio.service.findAll: Promise.all over
      Project (PUBLISHED, deletedAt null)          → type 'project'
      Service/Product/Tool/SuccessCase (PUBLISHED) → legacy types
      BlogPost (PUBLISHED, tags hasSome [laboratorio,experimento], NOT articulo) → type 'laboratorio'
  → merge, sort by createdAt desc, paginate
```

### Simulator serving flow
```
Editor node (data-simulator-id) → <iframe src="/api/simulators/:id/content" sandbox="allow-scripts">
  → simulator.controller.getContent: fetch record (deletedAt null, size ≤ 1MB)
  → storageService.downloadFile('simulators', fileName) → stream buffer
  → res: text/html + CSP sandbox + frame-ancestors + no-store
```

---

## Data Model Changes (Prisma)

```prisma
model Project {
  id               String      @id @default(cuid())
  title            String
  slug             String      @unique
  shortDescription String
  body             String          // rich HTML (TipTap)
  images           String[]
  repositoryUrl    String?
  tags             String[]
  featured         Boolean     @default(false)
  order            Int         @default(0)
  status           PostStatus  @default(DRAFT)
  deletedAt        DateTime?
  publishedAt      DateTime?
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  @@index([status, deletedAt])
  @@index([publishedAt])
  @@index([featured, deletedAt])
}

model Simulator {
  id         String   @id @default(cuid())
  title      String
  slug       String   @unique
  fileName   String       // object key inside 'simulators' bucket
  size       Int          // bytes (enforced ≤ 1MB at upload AND serve time)
  mimeType   String   @default("text/html")
  width      Int?         // display width px (dimension limit override)
  height     Int?         // display height px (dimension limit override)
  uploadedAt DateTime @default(now())
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  deletedAt  DateTime?

  @@index([deletedAt])
}
```

| Model | Change | Notes |
|---|---|---|
| `Project` | **New** | No `type` enum — classification via free-form `tags` (spec). `featured`/`order` kept (spec requires them). |
| `BlogPost` | Add `tags String[]` | Category column kept; derived from first tag on write. `hasSome` queries (Prisma does not index scalar-list fields) — fine at this scale. |
| `Simulator` | **New** | Phase 4. |

---

## API Endpoints Changes

### Phase 1 — Project CRUD (`/api/projects`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | public | Filters: status (default PUBLISHED; admin may pass status), tag, search, page, limit. Always `deletedAt: null`. |
| GET | `/api/projects/tags` | public | Distinct tags among PUBLISHED, non-deleted, sorted. |
| GET | `/api/projects/by-id/:id` | JWT | Admin fetch for editing. |
| GET | `/api/projects/:slug` | public | Detail; PUBLISHED + deletedAt null only, else 404. |
| POST | `/api/projects` | JWT | Create; `publishedAt` set when status=PUBLISHED. |
| PUT | `/api/projects/:id` | JWT | Update (partial via `projectUpdateSchema`). |
| DELETE | `/api/projects/:id` | JWT | Soft-delete (set deletedAt). |
| PATCH | `/api/projects/:id/restore` | JWT | Clear deletedAt. |
| PATCH | `/api/projects/:id/status` | JWT | Status change (+publishedAt logic). |
| PATCH | `/api/projects/:id/reorder` | JWT | Set order. |

**Route-order guard**: `/tags` and `/by-id/:id` MUST be registered before `/:slug` (Express matches in order) — covered by integration tests.

### Phase 1 — Recruiter aggregation (moved)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/portfolio/projects` | public | Merged Project + Service + Product + Tool + SuccessCase + lab blog posts; **every source** `status=PUBLISHED` + `deletedAt=null`; filters: classification (tags for project, classification for legacy), type, page, limit. |
| GET | `/api/portfolio/projects/recent` | public | Top N merged by createdAt. |
| GET | `/api/portfolio/projects/classifications` | public | Legacy classifications + project tags. |

### Phase 2 — Blog tags + uploads

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/blog-posts/tags` | public | Distinct tags among PUBLISHED, non-deleted, sorted (register before `/:slug`). |
| GET | `/api/blog-posts?tag=X` | public | Modified — tag combines with category/search via AND (`tags: { hasSome: [X] }`). |
| POST/PUT | `/api/blog-posts` | JWT | Modified — accept `tags[]`; category derived from first tag. |
| POST | `/api/upload` | JWT | Modified — honor `bucket` from body against config allowlist (`images`, `documents`, `simulators`, + existing module buckets); unknown → 400; missing → default. |

### Phase 4 — Simulators

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/simulators/upload` | JWT | multer `file` (≤1MB, `.html`/`text/html` only); bucket forced `simulators`; creates record + uploads object. |
| GET | `/api/simulators` | JWT | Admin list (editor picker). |
| GET | `/api/simulators/:id` | JWT | Metadata (editor prefill). |
| GET | `/api/simulators/:id/content` | public | Streams raw HTML with sandbox headers (Decision 6); unknown id or size > limit → 404/400. |

---

## Component Architecture

### Shared (`@jsoft/shared`)
- `schemas/project.schema.ts` — `projectSchema`, `projectUpdateSchema`, `projectFilterSchema` (status/tag/search/page/limit), `projectStatusSchema`, `tagsSchema` helper; `index.ts` exports.
- `schemas/blogPost.schema.ts` — add `tags: tagsSchema.optional()`, filter gains `tag`.
- `utils/sanitize.ts` — `sanitizeHtml(html, { allowMedia })` with restricted iframe regex (Decision 5).
- `components/RichTextEditor/` (Phase 3) — `RichTextEditor.tsx` (props `{ value, onChange, minHeight }`), extensions: StarterKit (headings 1–4), Underline, Link, TextAlign, Highlight + custom `InlineImage` (serializes `<figure><img>`), `InlineVideo` (serializes `<video src>`), `SimulatorPlaceholder` (serializes `<div data-simulator-id>`); toolbar extracted from `admin-panel TipTapEditor`. TipTap deps move into shared package.

### Admin panel (`admin-panel/src/`)
- `components/shared/TagInput.tsx` — free-entry with suggestions (fetches `/api/{entity}/tags`), chips, max 10.
- `components/projects/ProjectTable.tsx`, `pages/projects/{ProjectsListPage,ProjectCreatePage,ProjectEditPage}.tsx`; `api/projects.api.ts`; `hooks/useProjects.ts` (list/create/update/softDelete/restore/status/reorder/tags).
- Phase 3: swap `TipTapEditor` for shared `RichTextEditor` in Project/Product/Tool/Blog forms.
- Phase 2 form gaps: `pages/success-cases/` create+edit gain videos/links fields; `pages/services/` gain includedItems/technicalExplanation (schemas already support them).
- `components/uploads/ImageUploader.tsx` — accept aligned (Decision 3).

### Client site (`client-site/src/`)
- `pages/Projects/ProjectsListPage.tsx` + `ProjectDetailPage.tsx` (lazy, ErrorBoundary), routes `/proyectos`, `/proyectos/:slug` in `App.tsx`; `hooks/useProjects.ts` (list with tag filter + `useProjectTags`, `useProjectBySlug`); detail renders `sanitizeHtml(body, { allowMedia: true })`; i18n keys (neutral Spanish) in `i18n/translations.ts`.
- Phase 2: blog page gains tag filter auto-populated from `/api/blog-posts/tags`, combined AND with category/search, URL-param persistence, 300ms debounce.

### Recruiter site (`recruiter-site/src/`)
- `hooks/useProjects.ts` — paths migrated (Decision 1); `detailEndpointMap` gains `project: '/projects'`; type union extended (`project`, `laboratorio`); `ProjectSummary` gains `tags?: string[]`.
- `components/projects/ProjectList.tsx` — classification filter reads project tags + legacy classification; lab cards navigate to `/blog/:slug`.
- `components/projects/ProjectDetailModal.tsx` — add real-Project branch (`GET /api/projects/:slug`, sanitized body/images/tags/repositoryUrl).
- Phase 2: `pages/BlogPage.tsx` gains tag filter (same pattern as client).

---

## File Changes

### Phase 1 Core
| File | Action | Grounded In |
|---|---|---|
| `api/prisma/schema.prisma` | Modify | +`Project` model |
| `api/prisma/seed.ts` | Modify | Optional demo projects (tags-based classification) |
| `packages/shared/src/schemas/project.schema.ts` | **New** | projects spec |
| `packages/shared/src/schemas/index.ts` | Modify | Export project schemas |
| `api/src/services/project.service.ts` | **New** | CRUD, PUBLISHED-only queries, tags endpoint, publishedAt |
| `api/src/controllers/project.controller.ts` | **New** | Zod validation + handlers |
| `api/src/routes/project.routes.ts` | **New** | Route table above (order guard) |
| `api/src/services/portfolio.service.ts` | **New** | Aggregation (moved from `projects.service.ts`, + Project + lab posts + status filter) |
| `api/src/controllers/portfolio.controller.ts` | **New** | findAll/recent/classifications |
| `api/src/routes/portfolio.routes.ts` | **New** | `/api/portfolio/projects*` |
| `api/src/controllers/projects.controller.ts` + `api/src/services/projects.service.ts` | Delete | Replaced by project (CRUD) + portfolio (aggregation) |
| `api/src/app.ts` | Modify | Mount `/api/projects` (CRUD) + `/api/portfolio/projects` |
| `admin-panel/…/projects/*` (api, hooks, components, pages, i18n) | **New** | admin CRUD |
| `client-site/src/pages/Projects/*`, `hooks/useProjects.ts`, `App.tsx`, `i18n/translations.ts` | **New**/Modify | client pages |
| `recruiter-site/src/hooks/useProjects.ts`, `types/index.ts`, `ProjectList.tsx`, `ProjectDetailModal.tsx`, `RecentProjects.tsx` | Modify | aggregation migration |

### Phase 2 Blog+admin
| File | Action | Grounded In |
|---|---|---|
| `api/prisma/schema.prisma` | Modify | +`BlogPost.tags String[]` |
| `packages/shared/src/schemas/blogPost.schema.ts` | Modify | +tags, +tag filter |
| `api/src/services/blog-post.service.ts` | Modify | tags persist, derived category, tag filter, `getTags` |
| `api/src/controllers/blog-post.controller.ts`, `api/src/routes/blog-post.routes.ts` | Modify | +`GET /tags` (before `/:slug`) |
| `admin-panel/src/components/shared/TagInput.tsx` | **New** | used by Blog + Project forms |
| `admin-panel/src/pages/blog-posts/*`, `pages/success-cases/*`, `pages/services/*` | Modify | tag editor + form gaps |
| `client-site/src/pages/Blog/*`, `recruiter-site/src/pages/BlogPage.tsx` | Modify | tag filter + URL params |
| `api/src/controllers/upload.controller.ts`, `api/src/services/upload.service.ts` | Modify | bucket allowlist, pass bucket to storage |
| `admin-panel/src/components/uploads/ImageUploader.tsx` | Modify | accept alignment |
| `api/src/config/` (new `upload.config.ts` or env) | **New** | bucket allowlist (config-driven) |

### Phase 3 Editor
| File | Action | Grounded In |
|---|---|---|
| `packages/shared/src/components/RichTextEditor/*` | **New** | extracted TipTap + InlineImage/InlineVideo/SimulatorPlaceholder |
| `packages/shared/package.json` | Modify | +@tiptap deps |
| `admin-panel/src/components/blog-posts/TipTapEditor.tsx` | Delete | replaced by shared |
| `admin-panel` Project/Product/Tool/Blog forms | Modify | adopt `RichTextEditor` |
| `packages/shared/src/utils/sanitize.ts` | **New** | media allowlist util (used from Phase 1 for project detail) |
| `client-site`, `recruiter-site` renderers | Modify | `sanitizeHtml` with allowMedia |

### Phase 4 Simulators
| File | Action | Grounded In |
|---|---|---|
| `api/prisma/schema.prisma` | Modify | +`Simulator` model |
| `api/src/services/simulator.service.ts` | **New** | upload validation, record CRUD, download, size guard |
| `api/src/controllers/simulator.controller.ts` | **New** | upload/list/getMetadata/getContent (sandbox headers) |
| `api/src/routes/simulator.routes.ts` | **New** | route table above |
| `api/src/services/storage.service.ts` | Modify | +`downloadFile` (stream object server-side) |
| `api/src/app.ts` | Modify | mount `/api/simulators` |
| `packages/shared/…RichTextEditor/SimulatorNode.tsx` | Modify | bind placeholder → iframe (Phase 4 completion) |
| `client-site`/`recruiter-site` renderers | Modify | render simulator node as sandboxed iframe; standalone section component |

---

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit (api, strict TDD) | `project.service` | Jest + mocked Prisma: CRUD, PUBLISHED-only list/detail, soft-delete+restore, tag filter, `/tags` endpoint, publishedAt logic, slug 404 |
| Unit (api, strict TDD) | `portfolio.service` | **Regression guard for status leak**: assert every source is PUBLISHED + deletedAt null; lab-post inclusion (`laboratorio`/`experimento`), `articulo` exclusion, real-Project rows, pagination, classification filter |
| Unit (api, strict TDD) | `blog-post.service` | tags persistence, tag+category AND filter, `/tags`, derived category |
| Unit (api, strict TDD) | `upload.service` + controller | bucket allowlist (allowed/unknown/missing), accept alignment, SVG rejection, content-type serving |
| Unit (api, strict TDD) | `simulator.service` | upload validation (size 1MB, `.html` only, auth), record creation, serving headers, 404, oversize guard |
| Integration (api) | Route order | `/tags`/`/by-id/:id` before `/:slug`; protected routes 401 without JWT |
| TypeScript | All packages | `pnpm -r run typecheck` + per-package `tsc --noEmit` — 0 errors after each phase |
| Frontend | Forms/editor | Vitest where sensible (client-site has `test/`); editor behavior asserted manually + verify |
| Verify phase | Sanitization + sandbox | DOMPurify allowlist strip/preserve assertions; iframe `sandbox="allow-scripts"` without `allow-same-origin`; CSP header assertions on `/content` |

---

## Migration / Rollout

1. **Prisma**: Phase 1 `migrate dev --name add_project_model`; Phase 2 `add_blog_tags`; Phase 4 `add_simulator_model`. All additive — no data loss; rollback = revert migration + unregister routes.
2. **Tag migration** (Phase 2): seed/data script maps each existing `BlogPost.category` → first tag (`tags: [category]`); empty category → no tags. `category` column stays.
3. **Route reconciliation** (Phase 1): aggregation moves to `/api/portfolio/projects`; deploy shared→api→frontends so hooks land with the new paths.
4. **Deploy order per phase**: shared → Prisma migration → api → admin → client/recruiter.
5. **Archive-time note (heading normalization)**: the `blog-filters` delta heading ("Delta for Blog Frontend Filters") and requirement names ("Blog Grid (Recruiter Site)", "Client Site Blog Page") MUST match the main spec (`openspec/specs/blog-filters/spec.md`) requirement names exactly, so the archive merge matches by name. Verify headings before merging deltas.
6. **Supabase**: create private `simulators` bucket; `images`/`documents`/legacy buckets in allowlist.

---

## Open Questions

- [ ] Confirm `laboratorio` cards navigate to `/blog/:slug` (Decision 4) vs. modal fetch of `/api/blog-posts/:slug` — flagged for tasks phase.
- [ ] Bucket allowlist source: env var (`UPLOAD_BUCKET_ALLOWLIST`) vs. `api/src/config` constant — decide at apply (config-driven per upload-hardening risk note).
- [ ] `Simulator.width/height` defaults (e.g. 800×600) and whether standalone-section dimensions are config- or record-driven.
- [ ] Whether seed demo Projects should be added now (keeps client `/proyectos` non-empty for verify).