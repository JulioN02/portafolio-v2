# Spec: Reorder Removal — Remove drag-drop reorder from Services, Products, Tools, SuccessCases

## Description

Eliminate the `order` field and drag-drop reorder functionality from Service, Product, Tool, and SuccessCase entities across all layers. Ordering will be replaced by default `createdAt` descending sort (or status-based sort). This simplifies the data model and removes the complex drag-drop UI.

## Requirements

### 1. Prisma Schema: Remove `order` field from Service, Product, Tool, SuccessCase
- **Given** `api/prisma/schema.prisma` has `order Int @default(0)` on all four models
- **When** removing the field
- **Then** `order` column is dropped from all four models via Prisma migration
- **And** `@@index([order, createdAt])` is removed from all four models
- **And** BlogPost model is not affected (it never had an order field)

### 2. Shared Zod Schemas: Remove `order` field
- **Given** `serviceSchema`, `productSchema`, `toolSchema`, `successCaseSchema` all have `order: z.number().int().min(0).default(0)`
- **When** removing order
- **Then** `order` is removed from the main schema of each entity
- **And** `order` is removed from update schemas (via partial, automatic)
- **And** `ServiceResponse`, `ProductResponse`, `ToolResponse`, `SuccessCaseResponse` interfaces no longer include `order`

### 3. API Service Layer: Remove `reorder` method and `order` sort
- **Given** each service has `reorder(id, newOrder)` method and `findAll` sorts by `[{ order: 'asc' }, { createdAt: 'desc' }]`
- **When** removing reorder
- **Then** `reorder()` method is removed from all four services
- **And** `findAll()` sorts by `[{ createdAt: 'desc' }]` (or by `status` then `createdAt`)
- **And** `findFeatured()` (where kept for Product/Tool) sorts by `[{ createdAt: 'desc' }]` instead of `[{ order: 'asc' }, ...]`
- **And** `SERVICE_SELECT`, `PRODUCT_SELECT`, `TOOL_SELECT`, `SUCCESS_CASE_SELECT` no longer include `order`
- **And** `create()` and `update()` no longer handle `order` field

### 4. API Controller Layer: Remove `reorder` handler
- **Given** each controller has `reorder(req, res)` handler
- **When** removing reorder
- **Then** `reorder()` handler is removed from all four controllers

### 5. API Routes Layer: Remove reorder routes
- **Given** each router has `router.patch('/:id/reorder', ...)`
- **When** removing reorder
- **Then** reorder route is removed from all four routers

### 6. Admin Panel API Client: Remove `reorder` method
- **Given** each entity API client has `reorder(id, order)` → `PATCH /entity/:id/reorder`
- **When** removing reorder
- **Then** `reorder()` is removed from services.api.ts, products.api.ts, tools.api.ts, successCases.api.ts

### 7. Admin Panel Hooks: Remove `useReorder` mutation
- **Given** each hook factory has `useReorder()` mutation
- **When** removing reorder
- **Then** `useReorder()` is removed from useServices, useProducts, useTools, useSuccessCases hooks

### 8. Admin Panel UI: Remove drag-drop reorder components
- **Given** `ToolList.tsx` is a full drag-drop component with `onReorder` prop, `SuccessCaseList.tsx` also has drag-drop with `onReorder` prop
- **When** removing reorder UI
- **Then** `ToolList.tsx` is simplified to a non-draggable table or list (remove `draggable`, `onDragStart`, `onDragOver`, `onDrop`, `onDragEnd` handlers and state)
- **And** `SuccessCaseList.tsx` is simplified similarly — remove all drag-drop related code
- **And** `ToolList` and `SuccessCaseList` props no longer include `onReorder`
- **And** The info banner "Arrastra y suelta para reordenar herramientas" in `ToolsList.tsx` is removed
- **And** The similar reorder tip in `SuccessCasesList.tsx` is removed
- **And** The "Order" display text (e.g., `Order: {tool.order}`) is removed from list items

### 9. List pages: Remove reorder handlers and mutations
- **Given** `ToolsListPage.tsx` has `handleReorder` calling `reorderMutation`, `SuccessCasesList.tsx` has `handleReorder`
- **When** removing reorder
- **Then** `handleReorder` and `reorderMutation` are removed from both pages
- **And** `useReorder` is no longer destructured from hooks

### 10. Prisma Migration
- **Given** existing data has `order` values
- **When** running migration
- **Then** the `order` column is dropped from all four tables
- **And** existing order values are lost (acceptable — ordering will default to createdAt)
- **And** a backup or data snapshot should be considered if order data is valuable

## Acceptance Criteria
- [ ] Prisma migration drops `order` column from all four tables
- [ ] `PATCH /services/:id/reorder` returns 404
- [ ] Lists no longer show drag handles or order numbers
- [ ] Lists sort by `createdAt desc` by default
- [ ] TypeScript 0 errors
- [ ] No drag-drop behavior in ToolList or SuccessCaseList

## Affected Files
- `api/prisma/schema.prisma` — remove order from Service, Product, Tool, SuccessCase; remove indexes
- `packages/shared/src/schemas/service.schema.ts` — remove order
- `packages/shared/src/schemas/product.schema.ts` — remove order
- `packages/shared/src/schemas/tool.schema.ts` — remove order
- `packages/shared/src/schemas/successCase.schema.ts` — remove order
- `api/src/services/service.service.ts` — remove reorder, update findAll sort, remove from SELECT/create/update
- `api/src/services/product.service.ts` — remove reorder, update findAll sort, remove from SELECT/create/update
- `api/src/services/tool.service.ts` — remove reorder, update findAll sort, remove from SELECT/create/update
- `api/src/services/successCase.service.ts` — remove reorder, update findAll sort, remove from SELECT/create/update
- `api/src/controllers/service.controller.ts` — remove reorder handler
- `api/src/controllers/product.controller.ts` — remove reorder handler
- `api/src/controllers/tool.controller.ts` — remove reorder handler
- `api/src/controllers/successCase.controller.ts` — remove reorder handler
- `api/src/routes/service.routes.ts` — remove PATCH /:id/reorder
- `api/src/routes/product.routes.ts` — remove PATCH /:id/reorder
- `api/src/routes/tool.routes.ts` — remove PATCH /:id/reorder
- `api/src/routes/successCase.routes.ts` — remove PATCH /:id/reorder
- `admin-panel/src/api/services.api.ts` — remove reorder function
- `admin-panel/src/api/products.api.ts` — remove reorder function
- `admin-panel/src/api/tools.api.ts` — remove reorder function
- `admin-panel/src/api/successCases.api.ts` — remove reorder function
- `admin-panel/src/hooks/useServices.ts` — remove useReorder
- `admin-panel/src/hooks/useProducts.ts` — remove useReorder
- `admin-panel/src/hooks/useTools.ts` — remove useReorder
- `admin-panel/src/hooks/useSuccessCases.ts` — remove useReorder
- `admin-panel/src/components/tools/ToolList.tsx` — remove drag-drop, simplify to table
- `admin-panel/src/components/success-cases/SuccessCaseList.tsx` — remove drag-drop
- `admin-panel/src/pages/tools/ToolsList.tsx` — remove reorder handler, remove tip banner
- `admin-panel/src/pages/success-cases/SuccessCasesList.tsx` — remove reorder handler, remove tip
- `admin-panel/src/i18n/translations.ts` — remove `tools.reorder` translation key
