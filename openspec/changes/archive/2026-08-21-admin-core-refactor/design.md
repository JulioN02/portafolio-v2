# Design: Admin Core Refactor

## Overview

Refactor the admin panel to unify status management across all entities, clean up deprecated fields (featured/reorder), replace localStorage-based Pages with a DB-backed SiteSection model, and add shared UI components (BackButton, ConfirmDelete modal). Covers 7 sub-changes implementing the proposal's intent.

## Technical Approach

Bottom-up by architectural layer: shared schemas → Prisma → API services → API controllers/routes → Admin UI (hooks → components → pages). Each layer follows existing patterns found in `blog-post.service.ts`, `service.controller.ts`, and the TanStack Query hooks in `admin-panel/src/hooks/`.

---

## Architecture Decisions

### Decision 1: Status field — reuse BlogPost's PostStatus enum
**Choice**: Add `status PostStatus @default(DRAFT)` and `publishedAt DateTime?` to Service, Product, Tool, SuccessCase models.
**Alternatives considered**:
- New `EntityStatus` enum separate from BlogPost's — rejected because the values are identical (DRAFT/PUBLISHED/PRIVATE/ARCHIVED), creating a redundant enum adds maintenance overhead.
- Boolean `isPublished` — rejected because it can't represent PRIVATE/ARCHIVED states already used by BlogPost.
**Rationale**: Consistency across all entities. The existing `PostStatus` enum and its validation schema (`postStatusEnum` in `blogPost.schema.ts`) are immediately reusable. The `publishedAt` pattern (set automatically when status → PUBLISHED) mirrors the proven BlogPost implementation.

### Decision 2: Existing records become DRAFT on migration
**Choice**: Existing records automatically get `PostStatus DRAFT` via Prisma's `@default(DRAFT)`.
**Alternatives**: Auto-publish all existing records, or run a data migration script to set a specific status.
**Rationale**: DRAFT is the safest default — it doesn't make existing content publicly visible without review. Admins can manually publish after the migration. Prisma handles this automatically with no custom migration script.

### Decision 3: Remove featured from Service and SuccessCase only
**Choice**: Drop `featured` column from Service and SuccessCase models. Keep on Product and Tool.
**Alternatives**: Keep on all for future use, or remove from all.
**Rationale**: The proposal explicitly states this cleanup. Product.featured and Tool.featured remain because they serve the "featured tools/products" section on the homepage. Service and SuccessCase featured sections are being replaced by status-based filtering.

### Decision 4: Remove order from all 4 entities
**Choice**: Drop `order` column from Service, Product, Tool, SuccessCase.
**Alternatives**: Keep order as a display-only field without reorder API.
**Rationale**: Order is being centralized into SiteSection. Individual entity ordering within a section will default to `createdAt DESC`. This simplifies the data model and removes the incomplete drag-reorder implementations (Tools has drag-and-drop, others don't).

### Decision 5: SiteSection — new model replaces localStorage Pages
**Choice**: New `SiteSection` Prisma model with key, label, visible, order.
**Alternatives**: Extend an existing model, keep localStorage.
**Rationale**: The Pages feature manages a separate concern (homepage section visibility/order) not tied to any single entity. localStorage was a placeholder; a DB model provides persistence across devices/sessions, and enables the public client/recruiter sites to query section configuration from the API.

### Decision 6: SiteSection reorder — batch PUT endpoint
**Choice**: `PUT /api/site-sections/reorder` accepts `Array<{ id: string; order: number }>` and updates all at once in a transaction.
**Alternatives**: Individual PATCH per section (N+1 requests), or a single PATCH with a reordered ID array.
**Rationale**: Batch update is more efficient than N individual requests. A single PUT with all items allows the frontend to send the complete ordering in one go. Using a Prisma interactive transaction ensures consistency.

### Decision 7: BackButton — minimal shared component
**Choice**: `<BackButton to="/services" label="Volver a Servicios" />` — reusable nav button.
**Alternatives**: Inline Link per page, or a generic `useBackNavigation()` hook.
**Rationale**: The proposal calls for a shared component. A component is simpler than a hook and provides consistent styling. The `to` prop gives explicit control over the destination (not all pages are "back one step" in the history stack).

### Decision 8: ConfirmDelete — Modal-based shared component
**Choice**: Reusable `<ConfirmDeleteModal isOpen={boolean} onConfirm={() => {}} onCancel={() => {}} entityName="servicio" />` wrapping the existing shared `Modal` component.
**Alternatives**: `window.confirm()`, inline per-entity confirmation logic.
**Rationale**: The existing shared `Modal` from `@jsoft/shared` provides overlay + ESC key + backdrop click. Wrapping it provides a consistent delete confirmation UX across all entities, customizable with translation keys.

### Decision 9: StatusBadge and StatusSelect — shared components
**Choice**: Two shared components: `StatusBadge` (read-only colored pill) and `StatusSelect` (dropdown for inline status changes), mirroring the pattern in `BlogPostList.tsx`.
**Alternatives**: Keep inline styled elements per entity.
**Rationale**: DRY. Every entity list will show status; every entity form will have a status dropdown. Shared components ensure consistent colors, labels, and behavior.

### Decision 10: API backwards compatibility — low risk
**Choice**: Remove `featured` and `order` from Prisma models and API responses.
**Alternatives**: Deprecate gradually, return null for removed fields.
**Rationale**: No client/recruiter frontends exist in this monorepo. The admin panel is the sole consumer of the admin API endpoints. For the public endpoints (`GET /api/services` etc.), removing `featured` and `order` from the response is acceptable since consuming frontends (if any) don't exist in this repo. If external consumers exist, they would need a transition period — but the proposal accepts this as low-risk.

### Decision 11: Edit navigation fix — Tools and Blog lists use navigate()
**Choice**: Replace `window.location.href` with `useNavigate()` from React Router in Tools list and BlogPost list.
**Alternatives**: Keep `window.location.href` (full page reload).
**Rationale**: The Services and Products list already use `<Link>` component for edit navigation. Tools and BlogPost lists use `window.location.href`, causing full page reloads. Switching to `navigate()` provides SPA navigation (no reload) and consistency across the admin panel.

---

## Data Flow

### Status update flow:
```
Admin UI (StatusSelect dropdown)
  → hook (useUpdateStatus via TanStack useMutation)
    → api client (PATCH /api/{entity}/:id/status { status })
      → controller (validates with postStatusEnum)
        → service (sets status + publishedAt if PUBLISHED)
          → Prisma (update record)
```

### SiteSection flow:
```
Admin UI (PagesList)
  → hook (useSiteSections — TanStack useQuery/useMutation)
    → api client (GET/PUT/PATCH /api/site-sections/**)
      → controller → service → Prisma (SiteSection model)
```

---

## Data Model Changes

### Prisma Schema Changes Summary

| Model       | Additions                            | Removals          | Notes                         |
|-------------|--------------------------------------|-------------------|-------------------------------|
| Service     | `status PostStatus @default(DRAFT)`  | `featured`        | +`publishedAt DateTime?`      |
|             | `publishedAt DateTime?`              | `order`           | Remove `@@index([featured])`  |
| Product     | `status PostStatus @default(DRAFT)`  | `order`           | Keep `featured`               |
|             | `publishedAt DateTime?`              |                   | Remove `@@index([order])`     |
| Tool        | `status PostStatus @default(DRAFT)`  | `order`           | Keep `featured`               |
|             | `publishedAt DateTime?`              |                   | Remove `@@index([order])`     |
| SuccessCase | `status PostStatus @default(DRAFT)`  | `featured`        | +`publishedAt DateTime?`      |
|             | `publishedAt DateTime?`              | `order`           | Remove `@@index([featured])`  |
| NEW         | `SiteSection` model                  | —                 | key (unique), label, visible, order |

### Index changes
- Service: Remove `@@index([featured, deletedAt])`, remove `@@index([order, createdAt])`
- Product: Remove `@@index([order, createdAt])` (keep featured index)
- Tool: Remove `@@index([order, createdAt])` (keep featured index)
- SuccessCase: Remove `@@index([featured, deletedAt])`, remove `@@index([order, createdAt])`
- Add `@@index([status, deletedAt])` on Service, Product, Tool, SuccessCase (matching BlogPost pattern)
- SiteSection: `@@index([order])`, `@@unique([key])`

### Default Seed Data for SiteSection
| key            | label          | visible | order |
|----------------|----------------|---------|-------|
| `services`     | Servicios      | true    | 0     |
| `products`     | Productos      | true    | 1     |
| `tools`        | Herramientas   | true    | 2     |
| `success-cases`| Casos de Éxito | true    | 3     |

---

## API Endpoints Changes

### New endpoints

| Method | Path                          | Body                                    | Description                    |
|--------|-------------------------------|-----------------------------------------|--------------------------------|
| PATCH  | `/api/services/:id/status`    | `{ status: PostStatus }`                | Update service status          |
| PATCH  | `/api/products/:id/status`    | `{ status: PostStatus }`                | Update product status          |
| PATCH  | `/api/tools/:id/status`       | `{ status: PostStatus }`                | Update tool status             |
| PATCH  | `/api/success-cases/:id/status`| `{ status: PostStatus }`               | Update success case status     |
| GET    | `/api/site-sections`          | —                                       | List all sections (ordered)    |
| PUT    | `/api/site-sections/reorder`  | `[{ id, order }]`                       | Batch update order             |
| PATCH  | `/api/site-sections/:id`      | `{ visible?, label? }`                  | Update visibility/label        |

### Removed endpoints

| Removed                              | Reason                   |
|--------------------------------------|--------------------------|
| `PATCH /api/services/:id/featured`   | Featured removed         |
| `PATCH /api/success-cases/:id/featured` | Featured removed      |
| `PATCH /api/services/:id/reorder`    | Order removed            |
| `PATCH /api/products/:id/reorder`    | Order removed            |
| `PATCH /api/tools/:id/reorder`       | Order removed            |
| `PATCH /api/success-cases/:id/reorder`| Order removed           |

### Kept endpoints (no change)

| Endpoint                              | Reason                     |
|---------------------------------------|----------------------------|
| `PATCH /api/products/:id/featured`    | Featured stays on Product  |
| `PATCH /api/tools/:id/featured`       | Featured stays on Tool     |

---

## Component Architecture

### New shared components (in `admin-panel/src/components/shared/`)

#### StatusBadge
```tsx
// Read-only status badge with colored pill
<StatusBadge status="PUBLISHED" />
// Colors (matching BlogPostList pattern):
// DRAFT → amber, PUBLISHED → green, PRIVATE → blue, ARCHIVED → gray
```

#### StatusSelect
```tsx
// Inline dropdown for status changes in list views
<StatusSelect
  value={entity.status}
  onChange={(newStatus) => updateStatus(entity.id, newStatus)}
/>
// Options translated via i18n keys: blog.draft, blog.published, blog.private, blog.archived
```

#### BackButton
```tsx
interface BackButtonProps {
  to: string;          // Route path, e.g. "/services"
  label?: string;      // Optional, defaults to generic "Volver"
}
```

#### ConfirmDeleteModal
```tsx
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  entityName: string;  // Translated name e.g. "servicio" / "service"
  title?: string;      // Optional, defaults to "Confirmar eliminación"
}
// Wraps the shared Modal component from @jsoft/shared
// Renders: title + "¿Eliminar {entityName}?" + Confirm/Cancel buttons
```

### Modified list tables (all entities)
- Add `StatusBadge` column in table header before Actions
- Add `StatusSelect` for inline status changes (like BlogPostList)
- Remove `Featured` column from Service and SuccessCase tables
- Remove `Order` column from Tool list (no more reorder)
- Remove `Order` display from all list views
- Replace `window.location.href` with `navigate()` / `<Link>` for edit buttons (Tools, Blog)

### Modified edit forms (all entities)
- Add `Select` for status field (reusing `postStatusEnum` options)
- Add `BackButton` at the top of each edit page
- Replace inline delete confirmation with `ConfirmDeleteModal`

### SiteSection page (PagesList.tsx)
- Replace `useSiteSections` localStorage hook with TanStack Query hooks using new API
- Remove "Add Section" UI (sections are seeded, not user-creatable)
- Keep: toggle visibility, reorder up/down (now persisted via API)
- Update info banner to say changes are saved via API

---

## File Changes

### Layer 1: Shared schemas (`packages/shared/src/schemas/`)

| File                    | Action   | Details                                       |
|-------------------------|----------|-----------------------------------------------|
| `service.schema.ts`     | Modify   | Add `status: postStatusEnum.default('DRAFT')`, remove `order`, remove `featured`. Add `siteSectionSchema`, `siteSectionUpdateSchema`. Update `ServiceResponse` to include `status`, `publishedAt`. |
| `product.schema.ts`     | Modify   | Add `status`, `publishedAt`. Remove `order`. Update `ProductResponse`. Keep `featured`. |
| `tool.schema.ts`        | Modify   | Add `status`, `publishedAt`. Remove `order`. Update `ToolResponse`. Keep `featured`. |
| `successCase.schema.ts` | Modify   | Add `status`, `publishedAt`. Remove `order`, `featured`. Update `SuccessCaseResponse`. |
| `index.ts`              | Modify   | Export `siteSectionSchema`, `siteSectionUpdateSchema`, `SiteSectionInput`, `SiteSectionResponse` |

### Layer 2: API (`api/`)

| File                                     | Action   | Details                                                      |
|------------------------------------------|----------|--------------------------------------------------------------|
| `prisma/schema.prisma`                   | Modify   | +status +publishedAt on 4 models, -featured on 2, -order on 4, +SiteSection model |
| `prisma/seed.ts`                         | Modify   | Add default SiteSection seed data                            |
| `src/services/service.service.ts`        | Modify   | +updateStatus, -reorder, -toggleFeatured, update SELECT, update findAll orderBy |
| `src/services/product.service.ts`        | Modify   | +updateStatus, -reorder, update SELECT, update findAll orderBy |
| `src/services/tool.service.ts`           | Modify   | +updateStatus, -reorder, update SELECT, update findAll orderBy |
| `src/services/successCase.service.ts`    | Modify   | +updateStatus, -reorder, -toggleFeatured, update SELECT      |
| `src/services/siteSection.service.ts`    | **New**  | findAll, reorder (batch), update                              |
| `src/controllers/service.controller.ts`  | Modify   | +updateStatus, -reorder, -toggleFeatured                     |
| `src/controllers/product.controller.ts`  | Modify   | +updateStatus, -reorder                                      |
| `src/controllers/tool.controller.ts`     | Modify   | +updateStatus, -reorder                                      |
| `src/controllers/successCase.controller.ts`| Modify | +updateStatus, -reorder, -toggleFeatured                    |
| `src/controllers/siteSection.controller.ts`| **New** | findAll, reorder, update                                    |
| `src/routes/service.routes.ts`           | Modify   | Replace reorder/featured with status                          |
| `src/routes/product.routes.ts`           | Modify   | Replace reorder with status                                   |
| `src/routes/tool.routes.ts`              | Modify   | Replace reorder with status                                   |
| `src/routes/successCase.routes.ts`       | Modify   | Replace reorder/featured with status                          |
| `src/routes/siteSection.routes.ts`       | **New**  | GET /, PUT /reorder, PATCH /:id                               |
| `src/app.ts`                             | Modify   | Add `app.use('/api/site-sections', siteSectionRoutes)`        |

### Layer 3: Admin UI (`admin-panel/src/`)

| File                                         | Action   | Details                                                      |
|----------------------------------------------|----------|--------------------------------------------------------------|
| `components/shared/StatusBadge.tsx`          | **New**  | Colored status pill component                                |
| `components/shared/StatusSelect.tsx`         | **New**  | Status dropdown for inline list changes                      |
| `components/shared/BackButton.tsx`           | **New**  | Navigation button to return to list page                     |
| `components/shared/ConfirmDeleteModal.tsx`   | **New**  | Modal-based delete confirmation                              |
| `api/services.api.ts`                        | Modify   | +updateStatus, -toggleFeatured, -reorder                     |
| `api/products.api.ts`                        | Modify   | +updateStatus, -reorder                                      |
| `api/tools.api.ts`                           | Modify   | +updateStatus, -reorder                                      |
| `api/successCases.api.ts`                    | Modify   | +updateStatus, -toggleFeatured, -reorder                     |
| `api/siteSections.api.ts`                    | **New**  | getAll, reorder, update                                      |
| `hooks/useServices.ts`                       | Modify   | +useUpdateStatus, -useToggleFeatured                         |
| `hooks/useProducts.ts`                       | Modify   | +useUpdateStatus, -useReorder                                |
| `hooks/useTools.ts`                          | Modify   | +useUpdateStatus, -useReorder, -useToggleFeatured            |
| `hooks/useSuccessCases.ts`                   | Modify   | +useUpdateStatus, -useReorder, -useToggleFeatured            |
| `hooks/useSiteSections.ts`                   | Modify   | Replace localStorage logic with TanStack Query hooks         |
| `components/services/ServiceTable.tsx`        | Modify   | Add StatusBadge/StatusSelect, remove featured column          |
| `components/products/ProductTable.tsx`        | Modify   | Add StatusBadge/StatusSelect, remove order column             |
| `components/tools/ToolList.tsx`              | Modify   | Add StatusBadge/StatusSelect, remove reorder/drag-and-drop, remove featured |
| `components/success-cases/SuccessCaseTable.tsx`| Modify | Add StatusBadge/StatusSelect, remove featured, remove order   |
| `components/blog-posts/BlogPostList.tsx`      | Modify   | Replace `window.location.href` with navigate                 |
| `pages/services/ServiceEdit.tsx`             | Modify   | Add BackButton                                                |
| `pages/products/ProductEdit.tsx`             | Modify   | Add BackButton                                                |
| `pages/tools/ToolEdit.tsx`                   | Modify   | Add BackButton, add status field to form                      |
| `pages/success-cases/SuccessCaseEdit.tsx`    | Modify   | Add BackButton                                                |
| `pages/blog-posts/BlogPostEditPage.tsx`      | Modify   | Add BackButton                                                |
| `pages/services/ServicesList.tsx`            | Modify   | Replace toggleFeatured with status filter, status change      |
| `pages/products/ProductsList.tsx`            | Modify   | Add status filter, add ConfirmDeleteModal                     |
| `pages/tools/ToolsList.tsx`                  | Modify   | Remove reorder, replace featured with status, add ConfirmDeleteModal, fix navigate |
| `pages/success-cases/SuccessCasesList.tsx`   | Modify   | Remove featured, add status & ConfirmDeleteModal              |
| `pages/pages/PagesList.tsx`                  | Modify   | Replace localStorage with API hooks, remove "Add Section"     |
| `i18n/translations.ts`                       | Modify   | Add status translations for each entity, SiteSection keys, BackButton label |

---

## Testing Strategy

| Layer          | What                                        | Approach                                                   |
|----------------|---------------------------------------------|------------------------------------------------------------|
| Unit (API)     | Service `updateStatus` for all 4 entities   | Mock Prisma, verify publishedAt logic (follows blog-post.service.test.ts pattern) |
| Unit (API)     | Service `siteSectionService`                | Mock Prisma, test findAll, reorder, update                 |
| Integration    | Controller `updateStatus` endpoints         | Request → response validation tests                        |
| Integration    | SiteSection endpoints                       | Request → response tests for CRUD + reorder                |
| TypeScript     | All packages after schema changes           | `tsc --noEmit` — must pass with 0 errors                   |
| Build          | Admin panel build                           | `vite build` — must succeed                                |

---

## Migration / Rollout

### Prisma Migration Steps
1. Run `prisma migrate dev --name add_status_to_entities` — adds status + publishedAt, removes featured/order, creates SiteSection
2. Run seed script to populate default SiteSections
3. Verify existing data has `DRAFT` status applied

### Rollback Plan (from proposal)
1. `git checkout` all modified files
2. `prisma migrate down` to revert DB migration
3. Re-import seed if needed

### Deploy order
1. Shared schemas (types must be available before API/admin consume them)
2. Prisma migration
3. API (new endpoints must be ready before admin uses them)
4. Admin panel (last — consumes new endpoints)

---

## Open Questions

- [ ] Service filter schema currently has `featured` filter — should it be replaced with `status` filter?
- [ ] Product/Tool filter schemas also have `featured` filter — should remain since featured stays
- [ ] `findFeatured` methods in Service and SuccessCase services — should these be removed entirely or repurposed?
- [ ] Public client/recruiter frontends (if they exist outside this repo) may break if they consume `featured`/`order` fields from public API responses
