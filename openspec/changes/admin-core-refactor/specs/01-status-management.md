# Spec: Status Management for Services, Products, Tools, SuccessCases

## Description

Add `status` (DRAFT/PUBLISHED/PRIVATE/ARCHIVED) and `publishedAt` fields to Service, Product, Tool, and SuccessCase entities, mirroring the existing BlogPost pattern. This enables content lifecycle management (draft → publish → archive) across all content types.

## Requirements

### 1. Schema: Add `contentStatus` enum and status fields to all 4 entities
- **Given** the Prisma schema currently has `PostStatus` enum with DRAFT/PUBLISHED/PRIVATE/ARCHIVED values
- **When** adding status to Service, Product, Tool, and SuccessCase
- **Then** a shared enum `ContentStatus` should be created (or reuse/extend `PostStatus`) with values: `DRAFT`, `PUBLISHED`, `PRIVATE`, `ARCHIVED`
- **And** each model gets `status ContentStatus @default(DRAFT)` and `publishedAt DateTime?`
- **And** the existing BlogPost model should be migrated from `PostStatus` to `ContentStatus` (or keep `PostStatus` aliased to same values — decide during design)
- **And** composite indexes `@@index([status, deletedAt])` and `@@index([publishedAt])` are added to each model

### 2. Shared Zod Schemas: Add status enum and filter schema
- **Given** `packages/shared/src/schemas/service.schema.ts`, `product.schema.ts`, `tool.schema.ts`, `successCase.schema.ts` — none have status
- **When** updating each schema
- **Then** a shared `contentStatusEnum` is added and exported from index.ts
- **And** `serviceSchema`, `productSchema`, `toolSchema`, `successCaseSchema` get `status: contentStatusEnum.default('DRAFT')`
- **And** `serviceUpdateSchema`, `productUpdateSchema`, `toolUpdateSchema`, `successCaseUpdateSchema` include optional status
- **And** each filter schema adds `status: contentStatusEnum.optional()`
- **And** each entity's `Response` interface adds `status: string` and `publishedAt: Date | null`
- **And** a dedicated status-only schema is created per entity (e.g. `serviceStatusSchema = z.object({ status: contentStatusEnum })`) following the `blogPostStatusSchema` pattern
- **And** `featured` filter parameter is removed from `serviceFilterSchema` and `successCaseFilterSchema` (covered by spec 02)

### 3. Prisma Schema: Add fields and indexes
- **Given** models `Service`, `Product`, `Tool`, `SuccessCase` in `api/prisma/schema.prisma`
- **When** adding status and publishedAt
- **Then** each model gets `status ContentStatus @default(DRAFT)` and `publishedAt DateTime?`
- **And** each model gets `@@index([status, deletedAt])` and `@@index([publishedAt])`
- **And** existing `@@index([featured, deletedAt])` is removed from Service and SuccessCase models (covered by spec 02)
- **And** BlogPost's `PostStatus` enum is either renamed to `ContentStatus` or kept as an alias

### 4. Prisma Migration: Add non-nullable field with default
- **Given** existing rows in Service, Product, Tool, SuccessCase tables
- **When** running `prisma migrate dev`
- **Then** the migration adds `status` with default `DRAFT` and nullable `publishedAt`
- **And** all existing rows get `status = 'DRAFT'` and `publishedAt = null`

### 5. API Service Layer: Add `updateStatus` method to each service
- **Given** `api/src/services/blog-post.service.ts` has `updateStatus(id, status)` which also sets `publishedAt` when status changes to PUBLISHED
- **When** adding status to Service, Product, Tool, SuccessCase services
- **Then** each service gets:
  - `BLOG_POST_SELECT` equivalent updated to include `status` and `publishedAt`
  - `updateStatus(id, status)` method following the blog-post pattern
  - `create()` and `update()` methods handle `status` field, setting `publishedAt` when `status === 'PUBLISHED'`
  - `findAll()` filters support `status` query parameter
  - `reorder()` method is removed from services where order is eliminated (covered by spec 03)
  - `findFeatured()` and `toggleFeatured()` methods are removed from Service and SuccessCase services (covered by spec 02)

### 6. API Controller Layer: Add `updateStatus` endpoint
- **Given** `api/src/controllers/blog-post.controller.ts` has `updateStatus` which validates status via Zod and delegates to service
- **When** adding status controllers
- **Then** each controller gets:
  - `updateStatus(req, res)` handler that validates `{ status }` from body using `contentStatusEnum.safeParse()`
  - Calls `service.updateStatus(id, parsedStatus)`
  - Returns updated entity with 200 status
- **And** `toggleFeatured` and `reorder` handlers are removed from Service and SuccessCase controllers (covered by specs 02 & 03)

### 7. API Routes Layer: Add status route
- **Given** `api/src/routes/blog-post.routes.ts` has `router.patch('/:id/status', authMiddleware, blogPostController.updateStatus)`
- **When** adding routes
- **Then** each entity router gets `router.patch('/:id/status', authMiddleware, controller.updateStatus)`
- **And** `reorder` and `featured` routes are removed from Service and SuccessCase routers (covered by specs 02 & 03)

### 8. Admin Panel Hooks: Add `useUpdateStatus` mutation
- **Given** `admin-panel/src/hooks/useBlogPosts.ts` has `useUpdateStatus` mutation calling `blogPostsApi.updateStatus(id, status)`
- **When** adding hooks for Service, Product, Tool, SuccessCase
- **Then** each hook factory gets:
  - `useUpdateStatus()` mutation that calls `api.updateStatus(id, status)`
  - Invalidates the entity's query cache on success
- **And** `useToggleFeatured` is removed from useServices and useSuccessCases hooks
- **And** `useReorder` is removed from all four hooks (covered by spec 03)

### 9. Admin Panel API Client: Add `updateStatus` method
- **Given** each entity has an API client at `admin-panel/src/api/entity.api.ts`
- **When** adding status API
- **Then** each API client gets `updateStatus(id, status)` → `PATCH /entity/:id/status { status }`
- **And** `toggleFeatured()` is removed from services.api.ts and successCases.api.ts
- **And** `reorder()` is removed from all four API clients (covered by spec 03)

### 10. Admin Panel UI: Status display in lists
- **Given** `BlogPostList` shows status as a colored badge with inline select dropdown for quick changes
- **When** updating Services, Products, Tools, SuccessCases lists
- **Then** each list component shows the status as a colored badge using `statusColors` mapping (same as BlogPostList)
- **And** `onStatusChange` callback is wired through list pages to the mutation
- **And** status filter buttons are added to list pages (All / Draft / Published)

### 11. Admin Panel UI: Status select in forms
- **Given** `BlogPostForm` has a `<Select>` for status with DRAFT/PUBLISHED/PRIVATE/ARCHIVED options
- **When** updating ServiceForm, ProductForm, ToolForm, SuccessCaseForm
- **Then** each form gets a status `<Select>` field
- **And** it submits `status` in the form data

### 12. API Backwards Compatibility for Public Frontends
- **Given** public frontends (client, recruiter) consume the API and may not send status
- **When** querying public endpoints (`GET /services`, `GET /services/featured`, etc.)
- **Then** the `findAll` method should default to filtering `status: 'PUBLISHED'` when called from public context (or frontends should be updated to request PUBLISHED status)
- **And** the service layer should maintain backwards-compatible behavior for `findFeatured()` until removed (spec 02)

## Acceptance Criteria
- [ ] Prisma migration creates status + publishedAt columns with defaults
- [ ] `updateStatus` endpoint works for all 4 entities
- [ ] Setting status to PUBLISHED auto-sets `publishedAt`
- [ ] Lists show status badge with colors matching BlogPost pattern
- [ ] Forms have status select dropdown
- [ ] Filter by status works in findAll
- [ ] TypeScript 0 errors across all packages
- [ ] Existing rows default to DRAFT after migration
- [ ] Public frontends continue working with backward-compatible filtering

## Affected Files
- `api/prisma/schema.prisma` — add ContentStatus enum, status+publishedAt to 4 models
- `packages/shared/src/schemas/service.schema.ts` — add status, create serviceStatusSchema
- `packages/shared/src/schemas/product.schema.ts` — add status, create productStatusSchema
- `packages/shared/src/schemas/tool.schema.ts` — add status, create toolStatusSchema
- `packages/shared/src/schemas/successCase.schema.ts` — add status, create successCaseStatusSchema
- `packages/shared/src/schemas/index.ts` — export new schemas
- `api/src/services/service.service.ts` — add updateStatus, update SELECT, add status filter
- `api/src/services/product.service.ts` — add updateStatus, update SELECT, add status filter
- `api/src/services/tool.service.ts` — add updateStatus, update SELECT, add status filter
- `api/src/services/successCase.service.ts` — add updateStatus, update SELECT, add status filter
- `api/src/controllers/service.controller.ts` — add updateStatus handler
- `api/src/controllers/product.controller.ts` — add updateStatus handler
- `api/src/controllers/tool.controller.ts` — add updateStatus handler
- `api/src/controllers/successCase.controller.ts` — add updateStatus handler
- `api/src/routes/service.routes.ts` — add PATCH /:id/status
- `api/src/routes/product.routes.ts` — add PATCH /:id/status
- `api/src/routes/tool.routes.ts` — add PATCH /:id/status
- `api/src/routes/successCase.routes.ts` — add PATCH /:id/status
- `admin-panel/src/api/services.api.ts` — add updateStatus
- `admin-panel/src/api/products.api.ts` — add updateStatus
- `admin-panel/src/api/tools.api.ts` — add updateStatus
- `admin-panel/src/api/successCases.api.ts` — add updateStatus
- `admin-panel/src/hooks/useServices.ts` — add useUpdateStatus
- `admin-panel/src/hooks/useProducts.ts` — add useUpdateStatus
- `admin-panel/src/hooks/useTools.ts` — add useUpdateStatus
- `admin-panel/src/hooks/useSuccessCases.ts` — add useUpdateStatus
- `admin-panel/src/components/services/ServiceTable.tsx` — show status badge
- `admin-panel/src/components/products/ProductTable.tsx` — show status badge
- `admin-panel/src/components/tools/ToolList.tsx` — show status badge
- `admin-panel/src/components/success-cases/SuccessCaseList.tsx` — show status badge
- `admin-panel/src/components/services/ServiceForm.tsx` — add status select
- `admin-panel/src/components/products/ProductForm.tsx` — add status select
- `admin-panel/src/components/tools/ToolForm.tsx` — add status select
- `admin-panel/src/components/success-cases/SuccessCaseForm.tsx` — add status select
- `admin-panel/src/pages/services/ServicesList.tsx` — add status filter + inline change
- `admin-panel/src/pages/products/ProductsList.tsx` — add status filter + inline change
- `admin-panel/src/pages/tools/ToolsList.tsx` — add status filter + inline change
- `admin-panel/src/pages/success-cases/SuccessCasesList.tsx` — add status filter + inline change
- `admin-panel/src/i18n/translations.ts` — add status-related translation keys
