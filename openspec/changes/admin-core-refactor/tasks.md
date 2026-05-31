# Tasks: Admin Core Refactor

**Change**: `admin-core-refactor`
**Date**: 2026-05-30
**Total tasks**: 34 tasks across 7 phases

---

## Phase A: Shared Layer (Schemas)

Deploy order prerequisite: Shared types must be available before Prisma/API/Admin consume them.

---

### [1.1] Update Service Zod schema — add status, remove featured/order
**Package**: `packages/shared`
**Files**:
- `packages/shared/src/schemas/service.schema.ts`

**Description**:
- Add `status: postStatusEnum.default('DRAFT')` and `publishedAt: z.date().optional()` to `serviceSchema`
- Remove `order` and `featured` fields from `serviceSchema`
- Remove `featured` from `serviceFilterSchema`, add `status: postStatusEnum.optional()`
- Create `serviceStatusSchema` = `z.object({ status: postStatusEnum })` (for PATCH /:id/status endpoint)
- Add `publishedAt: Date | null` to `ServiceResponse` interface
- Export new types: `ServiceStatusInput`

**Reference**: BlogPost schema at `packages/shared/src/schemas/blogPost.schema.ts` lines 6-7, 23, 44-46

**Depends on**: None

**Verification**: `tsc --noEmit` passes, `ServiceResponse` includes `status` and `publishedAt`, excludes `featured` and `order`

---

### [1.2] Update Product Zod schema — add status, remove order
**Package**: `packages/shared`
**Files**:
- `packages/shared/src/schemas/product.schema.ts`

**Description**:
- Add `status: postStatusEnum.default('DRAFT')` and `publishedAt: z.date().optional()` to `productSchema`
- Remove `order` from `productSchema` (keep `featured`)
- Add `status: postStatusEnum.optional()` to `productFilterSchema`
- Create `productStatusSchema` = `z.object({ status: postStatusEnum })`
- Add `publishedAt: Date | null` to `ProductResponse`
- Export new types

**Depends on**: None

**Verification**: `tsc --noEmit` passes, `ProductResponse` includes `status` and `publishedAt`, excludes `order`

---

### [1.3] Update Tool Zod schema — add status, remove order
**Package**: `packages/shared`
**Files**:
- `packages/shared/src/schemas/tool.schema.ts`

**Description**:
- Add `status: postStatusEnum.default('DRAFT')` and `publishedAt: z.date().optional()` to `toolSchema`
- Remove `order` from `toolSchema` (keep `featured`)
- Add `status: postStatusEnum.optional()` to `toolFilterSchema`
- Create `toolStatusSchema` = `z.object({ status: postStatusEnum })`
- Add `publishedAt: Date | null` to `ToolResponse`
- Export new types

**Depends on**: None

**Verification**: `tsc --noEmit` passes, `ToolResponse` includes `status` and `publishedAt`, excludes `order`

---

### [1.4] Update SuccessCase Zod schema — add status, remove featured/order
**Package**: `packages/shared`
**Files**:
- `packages/shared/src/schemas/successCase.schema.ts`

**Description**:
- Add `status: postStatusEnum.default('DRAFT')` and `publishedAt: z.date().optional()` to `successCaseSchema`
- Remove `order` and `featured` from `successCaseSchema`
- Remove `featured` from `successCaseFilterSchema`, add `status: postStatusEnum.optional()`
- Create `successCaseStatusSchema` = `z.object({ status: postStatusEnum })`
- Add `publishedAt: Date | null` to `SuccessCaseResponse`
- Export new types

**Depends on**: None

**Verification**: `tsc --noEmit` passes, `SuccessCaseResponse` includes `status` and `publishedAt`, excludes `featured` and `order`

---

### [1.5] Create SiteSection Zod schema + update index.ts
**Package**: `packages/shared`
**Files**:
- `packages/shared/src/schemas/siteSection.schema.ts` (NEW)
- `packages/shared/src/schemas/index.ts`

**Description**:
- Create new file `siteSection.schema.ts` with:
  - `siteSectionSchema` = `z.object({ key: z.string().min(2), label: z.string().min(2), visible: z.boolean().default(true), order: z.number().int().min(0).default(0) })`
  - `siteSectionUpdateSchema` = `z.object({ visible: z.boolean().optional(), label: z.string().min(2).optional() })`
  - `siteSectionReorderSchema` = `z.object({ sections: z.array(z.object({ id: z.string(), order: z.number().int().min(0) })) })`
  - `SiteSectionInput`, `SiteSectionUpdateInput`, `SiteSectionReorderInput` type exports
  - `SiteSectionResponse` interface: extends `SiteSectionInput` with `id`, `createdAt`, `updatedAt`
- Update `index.ts` to export all new schemas and types

**Depends on**: None

**Verification**: `tsc --noEmit` passes, `SiteSectionResponse` interface exists and is exported

---

## Phase B: Data Layer (Prisma)

Deploy order: After shared schemas, before API.

---

### [2.1] Update Prisma schema — all model changes
**Package**: `api`
**Files**:
- `api/prisma/schema.prisma`

**Description**:
Apply all data model changes from the design document:

**Service model**:
- Add `status PostStatus @default(DRAFT)`, `publishedAt DateTime?`
- Remove `featured Boolean @default(false)`, `order Int @default(0)`
- Remove `@@index([featured, deletedAt])`, `@@index([order, createdAt])`
- Add `@@index([status, deletedAt])`, `@@index([publishedAt])`

**Product model**:
- Add `status PostStatus @default(DRAFT)`, `publishedAt DateTime?`
- Remove `order Int @default(0)`
- Remove `@@index([order, createdAt])`
- Add `@@index([status, deletedAt])`, `@@index([publishedAt])`
- Keep `featured` and its index

**Tool model**:
- Add `status PostStatus @default(DRAFT)`, `publishedAt DateTime?`
- Remove `order Int @default(0)`
- Remove `@@index([order, createdAt])`
- Add `@@index([status, deletedAt])`, `@@index([publishedAt])`
- Keep `featured` and its index

**SuccessCase model**:
- Add `status PostStatus @default(DRAFT)`, `publishedAt DateTime?`
- Remove `featured Boolean @default(false)`, `order Int @default(0)`
- Remove `@@index([featured, deletedAt])`, `@@index([order, createdAt])`
- Add `@@index([status, deletedAt])`, `@@index([publishedAt])`

**NEW — SiteSection model**:
```prisma
model SiteSection {
  id        String   @id @default(cuid())
  key       String   @unique
  label     String
  visible   Boolean  @default(true)
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([order])
}
```

**Depends on**: [1.1], [1.2], [1.3], [1.4], [1.5]

**Verification**: `prisma validate` passes, all model fields match the design doc

---

### [2.2] Run Prisma migration and update seed
**Package**: `api`
**Files**:
- `api/prisma/` (migration generated)
- `api/prisma/seed.ts`

**Description**:
- Run `prisma migrate dev --name add_status_to_entities` to generate migration
- Update `api/prisma/seed.ts`:
  - Remove `order` and `featured` from sample service creation (they no longer exist)
  - Add `status: 'DRAFT'` to sample service creation
  - Add `SiteSection` seed data (4 default sections):
    - `{ key: 'services', label: 'Servicios', visible: true, order: 0 }`
    - `{ key: 'products', label: 'Productos', visible: true, order: 1 }`
    - `{ key: 'tools', label: 'Herramientas', visible: true, order: 2 }`
    - `{ key: 'success-cases', label: 'Casos de Éxito', visible: true, order: 3 }`
- Run seed: `prisma db seed`

**Depends on**: [2.1]

**Verification**: `prisma migrate dev` succeeds, seed creates 4 SiteSections, existing services get `status = 'DRAFT'`

---

## Phase C: API Layer (Services, Controllers, Routes)

Deploy order: After Prisma migration, before Admin UI.

---

### [3.1] Update Service API — service + controller + routes
**Package**: `api`
**Files**:
- `api/src/services/service.service.ts`
- `api/src/controllers/service.controller.ts`
- `api/src/routes/service.routes.ts`

**Description**:

**Service** (`service.service.ts`):
- Add `status` and `publishedAt` to `SERVICE_SELECT`
- Remove `order`, `featured` from `SERVICE_SELECT`
- In `findAll()`: remove `featured` filter, add `status` filter, change `orderBy` to `[{ createdAt: 'desc' }]`
- Remove `findFeatured()` method
- In `create()`: remove `order`, `featured` from data, add `status` with `publishedAt` logic (set `publishedAt` when `status === 'PUBLISHED'`, following `blog-post.service.ts` pattern)
- In `update()`: remove `order`, `featured` handling, add `status` with `publishedAt` logic
- Add `updateStatus(id, status)` method (mirroring `blogPostService.updateStatus` at blog-post.service.ts lines 144-155)
- Remove `reorder()` method

**Controller** (`service.controller.ts`):
- Add `updateStatus(req, res)` handler (validates body with `serviceStatusSchema`, calls `service.updateStatus`)
- Remove `findFeatured()` handler
- Remove `toggleFeatured()` handler
- Remove `reorder()` handler

**Routes** (`service.routes.ts`):
- Remove `router.get('/featured', ...)`
- Remove `router.patch('/:id/reorder', ...)`
- Remove `router.patch('/:id/featured', ...)`
- Add `router.patch('/:id/status', authMiddleware, serviceController.updateStatus)`

**Depends on**: [1.1], [2.2]

**Verification**: `tsc --noEmit` passes in api/, `PATCH /api/services/:id/status` responds correctly, `PATCH /api/services/:id/reorder` returns 404

---

### [3.2] Update Product API — service + controller + routes
**Package**: `api`
**Files**:
- `api/src/services/product.service.ts`
- `api/src/controllers/product.controller.ts`
- `api/src/routes/product.routes.ts`

**Description**:

**Service**:
- Add `status`, `publishedAt` to `PRODUCT_SELECT`
- Remove `order` from `PRODUCT_SELECT` (keep `featured`)
- In `findAll()`: add `status` filter, change `orderBy` to `[{ createdAt: 'desc' }]`
- In `create()`: remove `order`, add `status` with `publishedAt` logic
- In `update()`: remove `order`, add `status` with `publishedAt` logic
- Add `updateStatus(id, status)` method
- Remove `reorder()` method
- Keep `findFeatured()` (featured stays on Product)

**Controller**:
- Add `updateStatus(req, res)` handler
- Remove `reorder()` handler
- Keep `findFeatured()` and `toggleFeatured()` handlers

**Routes**:
- Remove `router.patch('/:id/reorder', ...)`
- Add `router.patch('/:id/status', authMiddleware, productController.updateStatus)`
- Keep `router.get('/featured', ...)` and `router.patch('/:id/featured', ...)`

**Depends on**: [1.2], [2.2]

**Verification**: `PATCH /api/products/:id/status` works, `PATCH /api/products/:id/reorder` returns 404, featured endpoints still work

---

### [3.3] Update Tool API — service + controller + routes
**Package**: `api`
**Files**:
- `api/src/services/tool.service.ts`
- `api/src/controllers/tool.controller.ts`
- `api/src/routes/tool.routes.ts`

**Description**:

**Service**:
- Add `status`, `publishedAt` to `TOOL_SELECT`
- Remove `order` from `TOOL_SELECT` (keep `featured`)
- In `findAll()`: add `status` filter, change `orderBy` to `[{ createdAt: 'desc' }]`
- In `create()`: remove `order`, add `status` with `publishedAt` logic
- In `update()`: remove `order`, add `status` with `publishedAt` logic
- Add `updateStatus(id, status)` method
- Remove `reorder()` method
- Keep `findFeatured()` (featured stays on Tool)

**Controller**:
- Add `updateStatus(req, res)` handler
- Remove `reorder()` handler
- Keep `findFeatured()` and `toggleFeatured()` handlers

**Routes**:
- Remove `router.patch('/:id/reorder', ...)`
- Add `router.patch('/:id/status', authMiddleware, toolController.updateStatus)`
- Keep `router.get('/featured', ...)` and `router.patch('/:id/featured', ...)`

**Depends on**: [1.3], [2.2]

**Verification**: `PATCH /api/tools/:id/status` works, `PATCH /api/tools/:id/reorder` returns 404, featured endpoints still work

---

### [3.4] Update SuccessCase API — service + controller + routes
**Package**: `api`
**Files**:
- `api/src/services/successCase.service.ts`
- `api/src/controllers/successCase.controller.ts`
- `api/src/routes/successCase.routes.ts`

**Description**:

**Service**:
- Add `status`, `publishedAt` to `SUCCESS_CASE_SELECT`
- Remove `order`, `featured` from `SUCCESS_CASE_SELECT`
- In `findAll()`: remove `featured` filter, add `status` filter, change `orderBy` to `[{ createdAt: 'desc' }]`
- Remove `findFeatured()` method
- In `create()`: remove `order`, `featured`, add `status` with `publishedAt` logic
- In `update()`: remove `order`, `featured`, add `status` with `publishedAt` logic
- Add `updateStatus(id, status)` method
- Remove `reorder()` method

**Controller**:
- Add `updateStatus(req, res)` handler
- Remove `findFeatured()` handler
- Remove `toggleFeatured()` handler
- Remove `reorder()` handler

**Routes**:
- Remove `router.get('/featured', ...)`
- Remove `router.patch('/:id/reorder', ...)`
- Remove `router.patch('/:id/featured', ...)`
- Add `router.patch('/:id/status', authMiddleware, successCaseController.updateStatus)`

**Depends on**: [1.4], [2.2]

**Verification**: `PATCH /api/success-cases/:id/status` works, `PATCH /api/success-cases/:id/featured` returns 404

---

### [3.5] Create SiteSection API — service + controller + routes + app registration
**Package**: `api`
**Files**:
- `api/src/services/siteSection.service.ts` (NEW)
- `api/src/controllers/siteSection.controller.ts` (NEW)
- `api/src/routes/siteSection.routes.ts` (NEW)
- `api/src/app.ts`

**Description**:

**Service** (`siteSection.service.ts`):
- `findAll()` → returns all sections ordered by `order` asc
- `findById(id)` → get single section
- `reorder(sections: Array<{ id: string; order: number }>)` → batch update in Prisma interactive transaction
- `update(id: string, data: { visible?: boolean; label?: string })` → partial update

**Controller** (`siteSection.controller.ts`):
- `findAll(req, res)` → GET all sections
- `findById(req, res)` → GET single section
- `reorder(req, res)` → PUT batch reorder, validates with `siteSectionReorderSchema`
- `update(req, res)` → PATCH section, validates with `siteSectionUpdateSchema`

**Routes** (`siteSection.routes.ts`):
- `GET /` → findAll (public)
- `GET /:id` → findById (public)
- `PUT /reorder` → reorder (auth middleware)
- `PATCH /:id` → update (auth middleware)

**App registration** (`app.ts`):
- Import `siteSectionRoutes`
- Add `app.use('/api/site-sections', siteSectionRoutes)`

**Depends on**: [1.5], [2.2]

**Verification**: `GET /api/site-sections` returns 4 seeded sections, `PUT /api/site-sections/reorder` batch updates, `PATCH /api/site-sections/:id` updates individual section

---

## Phase D: Admin UI — API Clients + Hooks

Deploy order: After API endpoints exist, before UI components.

---

### [4.1] Update services API client + hooks ✓\n**Package**: `admin-panel`
**Files**:
- `admin-panel/src/api/services.api.ts`
- `admin-panel/src/hooks/useServices.ts`

**Description**:

**API client** (`services.api.ts`):
- Add `updateStatus(id: string, status: string)` → `PATCH /services/:id/status { status }` (mirrors `blogPostsApi.updateStatus`)
- Add `status` to `getAll()` params
- Remove `toggleFeatured()` method
- Remove `featured` from `getAll()` params

**Hooks** (`useServices.ts`):
- Add `useUpdateStatus()` mutation (mirrors `useBlogPosts().useUpdateStatus()`)
- Remove `useToggleFeatured()` mutation
- Import and use `ServiceStatusInput` if needed for typing

**Depends on**: [3.1]

**Verification**: `tsc --noEmit` passes in admin-panel/, `servicesApi.updateStatus` exists, `useToggleFeatured` removed

---

### [4.2] Update products API client + hooks ✓\n**Package**: `admin-panel`
**Files**:
- `admin-panel/src/api/products.api.ts`
- `admin-panel/src/hooks/useProducts.ts`

**Description**:

**API client** (`products.api.ts`):
- Add `updateStatus(id: string, status: string)` → `PATCH /products/:id/status`
- Add `status` to `getAll()` params
- Remove `reorder()` method
- Keep `toggleFeatured()` (featured stays on Product)

**Hooks** (`useProducts.ts`):
- Add `useUpdateStatus()` mutation
- Remove `useReorder()` mutation
- Keep `useToggleFeatured()` mutation

**Depends on**: [3.2]

**Verification**: `productsApi.updateStatus` exists, `productsApi.reorder` removed, `useToggleFeatured` still exists

---

### [4.3] Update tools API client + hooks ✓\n**Package**: `admin-panel`
**Files**:
- `admin-panel/src/api/tools.api.ts`
- `admin-panel/src/hooks/useTools.ts`

**Description**:

**API client** (`tools.api.ts`):
- Add `updateStatus(id: string, status: string)` → `PATCH /tools/:id/status`
- Add `status` to `getAll()` params
- Remove `reorder()` method
- Keep `toggleFeatured()` (featured stays on Tool)

**Hooks** (`useTools.ts`):
- Add `useUpdateStatus()` mutation
- Remove `useReorder()` mutation
- Keep `useToggleFeatured()` mutation

**Depends on**: [3.3]

**Verification**: `toolsApi.updateStatus` exists, `toolsApi.reorder` removed

---

### [4.4] Update successCases API client + hooks ✓\n**Package**: `admin-panel`
**Files**:
- `admin-panel/src/api/successCases.api.ts`
- `admin-panel/src/hooks/useSuccessCases.ts`

**Description**:

**API client** (`successCases.api.ts`):
- Add `updateStatus(id: string, status: string)` → `PATCH /success-cases/:id/status`
- Remove `reorder()` method
- Remove `toggleFeatured()` method

**Hooks** (`useSuccessCases.ts`):
- Add `useUpdateStatus()` mutation
- Remove `useReorder()` mutation
- Remove `useToggleFeatured()` mutation

**Depends on**: [3.4]

**Verification**: `successCasesApi.updateStatus` exists, `toggleFeatured` and `reorder` removed, `useUpdateStatus` added to hook

---

### [4.5] Create siteSections API client + replace useSiteSections hook ✓\n**Package**: `admin-panel`
**Files**:
- `admin-panel/src/api/siteSections.api.ts` (NEW)
- `admin-panel/src/hooks/useSiteSections.ts` (REPLACE — was localStorage-based)

**Description**:

**API client** (`siteSections.api.ts`):
- `getAll()` → `GET /site-sections`
- `getById(id)` → `GET /site-sections/:id`
- `reorder(sections: Array<{ id: string; order: number }>)` → `PUT /site-sections/reorder`
- `update(id, data: { visible?: boolean; label?: string })` → `PATCH /site-sections/:id`

**Hook** (`useSiteSections.ts`):
- Replace entire file: remove localStorage `useState` + `useEffect` implementation
- Implement with TanStack Query:
  - `useQuery` with `queryKey: ['siteSections']` calling `siteSectionsApi.getAll()`
  - `useMutation` for `reorder` (invalidates siteSections query on success)
  - `useMutation` for `update` (invalidates siteSections query on success)
- Keep the same public interface: `{ sections, toggleSection, moveSection, isLoaded }` (or adapt as needed)
- `toggleSection(id)` → calls `update(id, { visible: !currentVisible })`
- `moveSection(id, direction)` → rebuilds order array, calls `reorder`
- Remove `saveSections` and `addSection` (sections are seeded, not user-creatable)

**Depends on**: [3.5]

**Verification**: `useSiteSections` fetches from API, `toggleSection` and `moveSection` persist via mutations, localStorage no longer used

---

## Phase E: Admin UI — Shared Components

Deploy order: Before pages that consume them.

---

### [5.1] Create StatusBadge and StatusSelect shared components
**Package**: `admin-panel`
**Files**:
- `admin-panel/src/components/shared/StatusBadge.tsx` (NEW)
- `admin-panel/src/components/shared/StatusSelect.tsx` (NEW)

**Description**:

**StatusBadge** (`StatusBadge.tsx`):
- Props: `status: string` (one of DRAFT/PUBLISHED/PRIVATE/ARCHIVED)
- Renders a `<span>` with colored pill style
- Color mapping (matching `BlogPostList.tsx` pattern at lines 28-33):
  - `DRAFT` → bg: `#fef3c7`, color: `#92400e` (amber)
  - `PUBLISHED` → bg: `#d1fae5`, color: `#065f46` (green)
  - `PRIVATE` → bg: `#dbeafe`, color: `#1e40af` (blue)
  - `ARCHIVED` → bg: `#f3f4f6`, color: `#6b7280` (gray)
- Uses translated labels via `useTranslation`: `blog.draft`, `blog.published`, `blog.private`, `blog.archived`

**StatusSelect** (`StatusSelect.tsx`):
- Props: `value: string`, `onChange: (newStatus: string) => void`
- Renders a styled `<select>` dropdown with same color styling as `BlogPostList.tsx` (lines 75-93)
- Options: DRAFT/PUBLISHED/PRIVATE/ARCHIVED with translated labels
- Inline `onChange` handler that calls parent's `onChange` with new value

**Depends on**: None (standalone components)

**Verification**: Component renders correctly with all 4 status colors, dropdown changes fire `onChange`

---

### [5.2] Create BackButton component
**Package**: `admin-panel`
**Files**:
- `admin-panel/src/components/shared/BackButton.tsx` (NEW)

**Description**:
- Props: `to: string` (route path), `label?: string` (default: `← Volver` or translated)
- Uses `useNavigate()` from `react-router-dom` for SPA navigation
- Renders a styled `<button>` with `←` prefix arrow and label text
- Styling: neutral gray background (`#6b7280`), white text, rounded corners (`borderRadius: '4px'`), `fontSize: '0.875rem'`, consistent with existing SuccessCaseEdit inline back button pattern
- Used in all edit/create pages to navigate back to the entity list

**Depends on**: None (standalone component)

**Verification**: Component renders with correct arrow + label, navigation works to any route

---

### [5.3] Create ConfirmDeleteModal component
**Package**: `admin-panel`
**Files**:
- `admin-panel/src/components/shared/ConfirmDeleteModal.tsx` (NEW)

**Description**:
- Props: `isOpen: boolean`, `title: string` (item title being deleted), `entityName: string` (e.g. "tool", "service"), `onConfirm: () => void`, `onCancel: () => void`, `isLoading?: boolean`
- Renders as overlay modal with semi-transparent backdrop + centered card
- Shows: warning icon, "Delete [entityName]?" heading, item title, "Are you sure?" message, Cancel (secondary) and Delete (red/danger) buttons
- Keyboard accessible: Escape closes, Enter confirms (when focused)
- Closes on backdrop click
- Uses existing CSS variables from admin panel for styling
- Delete button shows loading state when `isLoading` is true

**Depends on**: None (standalone component)

**Verification**: Modal opens/closes correctly, Confirm/Cancel callbacks fire, Escape/backdrop close work

---

## Phase F: Admin UI — Pages

Deploy order: After all hooks, API clients, and shared components exist.

---

### [6.1] Update Services list page
**Package**: `admin-panel`
**Files**:
- `admin-panel/src/pages/services/ServicesList.tsx`
- `admin-panel/src/components/services/ServiceTable.tsx`

**Description**:

**ServiceTable** (`ServiceTable.tsx`):
- Remove `onToggleFeatured` from props interface
- Remove featured column (th + td with toggle button)
- Add status column with `<StatusBadge status={service.status} />` and `<StatusSelect>` for inline changes
- Add `onStatusChange` callback to props
- Actions column stays the same

**ServicesList** (`ServicesList.tsx`):
- Import `useUpdateStatus` from hooks (replaces `useToggleFeatured`)
- Add status filter buttons (All / Draft / Published), mirroring BlogPostsListPage.tsx pattern
- Replace `handleToggleFeatured` with `handleStatusChange` calling `updateStatusMutation`
- Replace two-click delete pattern `deleteConfirm` state with `ConfirmDeleteModal`:
  - State: `const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)`
  - `handleDelete` opens modal instead of two-click logic
  - Render `<ConfirmDeleteModal>` with entityName="servicio"
- Pass `onStatusChange` to `ServiceTable`
- Remove `useToggleFeatured` from destructured hooks

**Depends on**: [4.1], [5.1], [5.3]

**Verification**: Status column shows, inline status change works, featured column gone, delete shows modal, status filter buttons work

---

### [6.2] Update Products list page
**Package**: `admin-panel`
**Files**:
- `admin-panel/src/pages/products/ProductsList.tsx`
- `admin-panel/src/components/products/ProductTable.tsx`

**Description**:

**ProductTable** (`ProductTable.tsx`):
- Add `onStatusChange` callback to props
- Add status column with `<StatusBadge>` and `<StatusSelect>`
- Keep featured column (featured stays on Product)
- Remove order column (no longer exists)

**ProductsList** (`ProductsList.tsx`):
- Import `useUpdateStatus` from hooks
- Add status filter buttons (All / Draft / Published)
- Replace two-click delete pattern with `ConfirmDeleteModal` (`entityName="producto"`)
- Pass `onStatusChange` to `ProductTable`

**Depends on**: [4.2], [5.1], [5.3]

**Verification**: Status column shows, featured column still there, no order column, delete shows modal

---

### [6.3] Update Tools list page — remove drag-drop, add status, fix SPA nav
**Package**: `admin-panel`
**Files**:
- `admin-panel/src/pages/tools/ToolsList.tsx`
- `admin-panel/src/components/tools/ToolList.tsx`

**Description**:

**ToolList** (`ToolList.tsx`):
- Remove `onReorder` from props interface
- Remove ALL drag-drop code: `draggable`, `onDragStart`, `onDragOver`, `onDrop`, `onDragEnd`, drag state (`dragId`, `dragOverId`)
- Remove sort by order (no longer needed)
- Remove order display (`Order: {tool.order}`)
- Keep `onToggleFeatured` (featured stays on Tool)
- Add `onStatusChange` callback to props
- Add status column with `<StatusBadge>` and `<StatusSelect>`
- Simplify to a clean card list (non-draggable)

**ToolsList** (`ToolsList.tsx`):
- Remove `useReorder` from destructured hooks
- Remove `handleReorder` function
- Remove the reorder info banner ("Arrastra y suelta para reordenar herramientas")
- Import `useNavigate` and `useUpdateStatus`
- Replace `window.location.href` with `navigate()` for edit navigation
- Replace two-click delete pattern with `ConfirmDeleteModal` (`entityName="herramienta"`)
- Add status filter buttons (All / Draft / Published)
- Add `handleStatusChange` calling `updateStatusMutation`

**Depends on**: [4.3], [5.1], [5.3]

**Verification**: No drag-drop behavior, status column shows, edit uses SPA navigation, delete shows modal, featured toggle stays

---

### [6.4] Update SuccessCases list page — remove drag-drop/featured, add status
**Package**: `admin-panel`
**Files**:
- `admin-panel/src/pages/success-cases/SuccessCasesList.tsx`
- `admin-panel/src/components/success-cases/SuccessCaseList.tsx`

**Description**:

**SuccessCaseList** (`SuccessCaseList.tsx`):
- Remove `onReorder` from props interface
- Remove ALL drag-drop code
- Remove `onToggleFeatured` from props interface, remove featured button
- Remove order display
- Add `onStatusChange` callback to props
- Add status display with `<StatusBadge>` and `<StatusSelect>`

**SuccessCasesList** (`SuccessCasesList.tsx`):
- Remove `useReorder`, `useToggleFeatured` from destructured hooks
- Remove `handleReorder`, `handleToggleFeatured`
- Import `useUpdateStatus` from hooks
- Replace `window.confirm()` delete with `ConfirmDeleteModal` (`entityName="caso de éxito"`)
- Remove reorder info text ("Arrastra y suelta..." reused `t('tools.reorder')`)
- Add status filter buttons (All / Draft / Published)
- Add `handleStatusChange` calling `updateStatusMutation`

**Depends on**: [4.4], [5.1], [5.3]

**Verification**: No drag-drop, no featured button, status column shows, delete uses modal, `window.confirm` no longer used

---

### [6.5] Update BlogPosts list page — SPA nav + confirm delete modal
**Package**: `admin-panel`
**Files**:
- `admin-panel/src/pages/blog-posts/BlogPostsListPage.tsx`
- `admin-panel/src/components/blog-posts/BlogPostList.tsx`

**Description**:

**BlogPostsListPage** (`BlogPostsListPage.tsx`):
- Import `useNavigate` from `react-router-dom`
- Replace `window.location.href = `/blog-posts/edit/${id}`` with `navigate(...)` in the `onEdit` callback
- Replace two-click delete pattern with `ConfirmDeleteModal` (`entityName="artículo"`)

**BlogPostList** (`BlogPostList.tsx`):
- No changes needed to the component itself — it already receives `onEdit` and `onDelete` callbacks from the page
- The existing status badge/select pattern in this component serves as reference for other lists

**Depends on**: [5.3]

**Verification**: Edit navigation uses SPA (no full reload), delete uses modal, no functional regression for status changes

---

### [6.6] Update PagesList — API-backed version
**Package**: `admin-panel`
**Files**:
- `admin-panel/src/pages/pages/PagesList.tsx`

**Description**:
- Import updated `useSiteSections` hook (now TanStack Query based)
- Add loading state from React Query (instead of the old `isLoaded`)
- Add error state handling
- Remove "Add Section" form entirely (`showAddForm`, `handleAddSection`, `newSectionId`, `newSectionLabel`, add error state) — sections are seeded, not user-creatable
- Toggle visibility still works but now persists via mutation
- Move up/down still works but now persists via mutation to API
- Update info banner text: remove "Los cambios se guardan localmente. Integración con API próximamente." — replace with "Los cambios se guardan automáticamente."

**Depends on**: [4.5]

**Verification**: Sections load from API, toggle persists, reorder persists, no "Add Section" UI, no localStorage usage

---

### [6.7] Add BackButton to all edit/create pages + status field to forms
**Package**: `admin-panel`
**Files**:
- `admin-panel/src/pages/services/ServiceEdit.tsx`
- `admin-panel/src/pages/services/ServiceCreate.tsx`
- `admin-panel/src/pages/products/ProductEdit.tsx`
- `admin-panel/src/pages/products/ProductCreate.tsx`
- `admin-panel/src/pages/tools/ToolEdit.tsx`
- `admin-panel/src/pages/tools/ToolCreate.tsx`
- `admin-panel/src/pages/blog-posts/BlogPostEditPage.tsx`
- `admin-panel/src/pages/blog-posts/BlogPostCreatePage.tsx`
- `admin-panel/src/pages/success-cases/SuccessCaseEdit.tsx`
- `admin-panel/src/pages/success-cases/SuccessCaseCreate.tsx`
- `admin-panel/src/components/services/ServiceForm.tsx`
- `admin-panel/src/components/products/ProductForm.tsx`
- `admin-panel/src/components/tools/ToolForm.tsx`
- `admin-panel/src/components/success-cases/SuccessCaseForm.tsx`

**Description**:

**BackButton on all edit/create pages**:
- In each page, add `<BackButton to="/{entity-route}" />` at the top, before the `<h1>` title
- Routes: `/services`, `/products`, `/tools`, `/blog-posts`, `/success-cases`
- In `SuccessCaseEdit.tsx` and `SuccessCaseCreate.tsx`: replace the existing inline back button (`<button onClick={() => navigate(...)} style={...}>← Back...</button>`) with the shared `<BackButton>` component
- For edit pages that have error state back buttons (like SuccessCaseEdit), replace those with BackButton too

**Status field in forms** (`ServiceForm.tsx`, `ProductForm.tsx`, `ToolForm.tsx`, `SuccessCaseForm.tsx`):
- Add `status` state initialized from `initialData?.status || 'DRAFT'`
- Add `<Select>` component for status (like BlogPostForm.tsx lines 133-144) with DRAFT/PUBLISHED/PRIVATE/ARCHIVED options using translated labels
- Include `status` in the submitted data object

**ServiceForm.tsx specific**:
- Remove `order` input (line 112-118)
- Remove `featured` checkbox (line 119-124)
- Add `status` select field

**ProductForm.tsx specific**:
- Remove `order` input (line 164-170)
- Keep `featured` checkbox (featured stays on Product)
- Add `status` select field

**ToolForm.tsx specific**:
- Remove `order` input (line 120-126)
- Keep `featured` checkbox
- Add `status` select field

**SuccessCaseForm.tsx specific**:
- Remove `order: 0` and `featured: false` hardcode from `handleSubmit` (line 86-87)
- Add `status` select field

**Depends on**: [5.2], and form changes depend on [1.1]-[1.4] (schema changes for status field typing)

**Verification**: All edit/create pages have back button, status dropdown in all forms, no order/featured fields on Service/SuccessCase forms, Product/Tool forms keep featured but remove order

---

### [6.8] Update translations
**Package**: `admin-panel`
**Files**:
- `admin-panel/src/i18n/translations.ts`

**Description**:
Add new translation keys and remove old ones:

**Remove**:
- `services.featured` — featured removed from services
- `tools.reorder` — reorder removed (both es and en)
- `tools.order` — order field removed
- `pages.idLabel`, `pages.labelLabel`, `pages.addSection`, `pages.cancel`, `pages.idPlaceholder`, `pages.labelPlaceholder`, `pages.required`, `pages.duplicate` — no more Add Section UI
- `pages.info` — replace with new text instead

**Add/Update**:
- `services.status` → "Estado" / "Status"
- `products.status` → "Estado" / "Status"
- `tools.status` → "Estado" / "Status"
- `successCases.status` → "Estado" / "Status"
- `common.back` → "Volver" / "Back" (generic back label for BackButton default)
- `common.deleteConfirm` → "¿Eliminar {entity}?" / "Delete {entity}?" (for ConfirmDeleteModal)
- `common.deleteTitle` → "Confirmar eliminación" / "Confirm deletion"
- Update `pages.info` → "Los cambios se guardan automáticamente." / "Changes are saved automatically."
- Add `services.statusFilter` / `products.statusFilter` / etc. if needed (can reuse `blog.draft`, `blog.published`)

**Depends on**: [5.1], [5.2], [5.3], [6.6] (knows which keys are needed)

**Verification**: All used translation keys exist, unused keys removed, no missing key errors at runtime

---

## Phase G: Verification & Build

---

### [7.1] Typecheck and build all packages
**Package**: All
**Files**: (all modified files)

**Description**:
- Run `tsc --noEmit` in `packages/shared/` — must pass with 0 errors
- Run `tsc --noEmit` in `api/` — must pass with 0 errors
- Run `tsc --noEmit` in `admin-panel/` — must pass with 0 errors
- Run `vite build` in `admin-panel/` — must succeed
- Fix any type errors or build failures

**Depends on**: All tasks [1.1] through [6.8]

**Verification**: All 3 packages typecheck with 0 errors, admin panel builds successfully

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| A: Shared Layer | 5 tasks (1.1-1.5) | Zod schemas for status, featured/order removal, SiteSection |
| B: Data Layer | 2 tasks (2.1-2.2) | Prisma schema, migration, seed |
| C: API Layer | 5 tasks (3.1-3.5) | Services, controllers, routes for all entities + SiteSection |
| D: Admin API + Hooks | 5 tasks (4.1-4.5) | API clients + TanStack Query hooks |
| E: Shared Components | 3 tasks (5.1-5.3) | StatusBadge, StatusSelect, BackButton, ConfirmDeleteModal |
| F: Admin Pages | 8 tasks (6.1-6.8) | List pages, forms, edit/create pages, translations |
| G: Verification | 1 task (7.1) | Typecheck, build |
| **Total** | **29 tasks** | |

### Deploy Order
1. Phase A (shared schemas)
2. Phase B (Prisma migration)
3. Phase C (API endpoints)
4. Phase D (admin API clients + hooks)
5. Phase E (shared components)
6. Phase F (admin pages + translations)
7. Phase G (verification)
