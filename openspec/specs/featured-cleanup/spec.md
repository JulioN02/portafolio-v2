# Spec: Featured Cleanup — Remove from Services and SuccessCases

## Description

Remove the `featured` boolean field from Service and SuccessCase entities across all layers (DB, API, shared schemas, admin UI). Keep `featured` on Product and Tool entities as-is. This eliminates redundant functionality and simplifies the data model.

## Requirements

### 1. Prisma Schema: Remove `featured` from Service and SuccessCase
- **Given** `api/prisma/schema.prisma` has `featured Boolean @default(false)` on both Service and SuccessCase models
- **When** removing the field
- **Then** `featured` column is dropped from Service and SuccessCase tables via Prisma migration
- **And** `@@index([featured, deletedAt])` is removed from both models
- **And** Product and Tool models retain their `featured` field and index unchanged

### 2. Shared Zod Schemas: Remove `featured` from Service and SuccessCase
- **Given** `packages/shared/src/schemas/service.schema.ts` has `featured: z.boolean().default(false)` and `serviceFilterSchema` has `featured: z.coerce.boolean().optional()`
- **When** removing featured
- **Then** `featured` is removed from `serviceSchema` and `serviceFilterSchema`
- **And** `featured` is removed from `successCaseSchema` and `successCaseFilterSchema`
- **And** `ServiceResponse` and `SuccessCaseResponse` interfaces no longer include `featured`
- **And** Product and Tool schemas keep `featured` unchanged

### 3. API Service Layer: Remove `findFeatured` and `toggleFeatured` for Service and SuccessCase
- **Given** `api/src/services/service.service.ts` has `findFeatured(limit)` and `api/src/services/successCase.service.ts` has `findFeatured(limit)` and `findRecent(limit)`
- **When** removing featured
- **Then** `findFeatured()` is removed from both services
- **And** `findRecent()` on successCase service remains (it's a general recent filter, not featured-specific)
- **And** `SERVICE_SELECT` and `SUCCESS_CASE_SELECT` no longer include `featured`
- **And** `create()`, `update()` no longer handle `featured` for these entities
- **And** `findAll()` no longer filters by `featured` for these entities
- **And** Product and Tool services retain their `findFeatured()` and featured handling

### 4. API Controller Layer: Remove `toggleFeatured` for Service and SuccessCase
- **Given** `api/src/controllers/service.controller.ts` and `successCase.controller.ts` have `toggleFeatured(req, res)`
- **When** removing featured controller
- **Then** `toggleFeatured()` handler is removed from both controllers
- **And** `findFeatured()` handler is removed from both controllers

### 5. API Routes Layer: Remove featured routes
- **Given** `api/src/routes/service.routes.ts` has `GET /featured` and `PATCH /:id/featured`, same for successCase
- **When** removing featured routes
- **Then** `router.get('/featured', ...)` and `router.patch('/:id/featured', ...)` are removed from both routers
- **And** Product and Tool routers keep their featured routes

### 6. Admin Panel API Client: Remove `toggleFeatured` for Services and SuccessCases
- **Given** `admin-panel/src/api/services.api.ts` and `successCases.api.ts` have `toggleFeatured(id, featured)` → `PATCH /entity/:id/featured`
- **When** removing featured
- **Then** `toggleFeatured()` is removed from both API clients
- **And** Products and Tools API clients keep `toggleFeatured()`

### 7. Admin Panel Hooks: Remove `useToggleFeatured` for Services and SuccessCases
- **Given** `admin-panel/src/hooks/useServices.ts` and `useSuccessCases.ts` have `useToggleFeatured()` mutation
- **When** removing featured
- **Then** `useToggleFeatured()` is removed from both hooks
- **And** Products and Tools hooks keep `useToggleFeatured()`

### 8. Admin Panel UI: Remove featured UI from Service and SuccessCase
- **Given** `ServiceTable.tsx` has a "Featured" column with toggle button, `SuccessCaseList.tsx` has featured toggle button, `ServiceForm.tsx` has featured checkbox
- **When** removing featured UI
- **Then** `ServiceTable.tsx` removes the Featured column entirely
- **And** `SuccessCaseList.tsx` removes the featured toggle button
- **And** `ServiceForm.tsx` removes the featured checkbox
- **And** `SuccessCaseForm.tsx` removes any featured-related code (currently hardcodes `featured: false` — can remove that hardcode)
- **And** `ServiceTable` props no longer include `onToggleFeatured` (updated interface)
- **And** `SuccessCaseList` props no longer include `onToggleFeatured` (updated interface)

### 9. Prisma Migration: Drop featured column
- **Given** existing data has `featured` values that may be true/false
- **When** running `prisma migrate dev`
- **Then** the migration drops the `featured` column from Service and SuccessCase tables
- **And** any rows with `featured = true` lose that flag (acceptable per change design — featured was unused in practice)

### 10. Public Frontends: Featured endpoints removed
- **Given** public frontends (client, recruiter) may call `GET /services/featured` or `GET /success-cases/featured`
- **When** removing these endpoints
- **Then** public frontends that consume these endpoints need to be updated to use regular filtered queries instead
- **And** the change should verify no breaking calls exist in client/recruiter frontend code

## Acceptance Criteria
- [ ] Prisma migration drops featured from Service and SuccessCase (no data loss beyond the field)
- [ ] `GET /services/featured` returns 404
- [ ] `PATCH /services/:id/featured` returns 404
- [ ] Service and SuccessCase tables/forms no longer show featured UI
- [ ] Product and Tool featured functionality remains unchanged
- [ ] TypeScript 0 errors
- [ ] Public frontends stop calling removed featured endpoints

## Affected Files
- `api/prisma/schema.prisma` — remove featured from Service, SuccessCase; remove indexes
- `packages/shared/src/schemas/service.schema.ts` — remove featured from schema and filter
- `packages/shared/src/schemas/successCase.schema.ts` — remove featured from schema and filter
- `api/src/services/service.service.ts` — remove findFeatured, remove from SELECT/create/update/filter
- `api/src/services/successCase.service.ts` — remove findFeatured, remove from SELECT/create/update/filter
- `api/src/controllers/service.controller.ts` — remove toggleFeatured, findFeatured handlers
- `api/src/controllers/successCase.controller.ts` — remove toggleFeatured, findFeatured handlers
- `api/src/routes/service.routes.ts` — remove GET /featured, PATCH /:id/featured
- `api/src/routes/successCase.routes.ts` — remove GET /featured, PATCH /:id/featured
- `admin-panel/src/api/services.api.ts` — remove toggleFeatured function
- `admin-panel/src/api/successCases.api.ts` — remove toggleFeatured function
- `admin-panel/src/hooks/useServices.ts` — remove useToggleFeatured
- `admin-panel/src/hooks/useSuccessCases.ts` — remove useToggleFeatured
- `admin-panel/src/components/services/ServiceTable.tsx` — remove featured column, update interface
- `admin-panel/src/components/success-cases/SuccessCaseList.tsx` — remove featured button, update interface
- `admin-panel/src/components/services/ServiceForm.tsx` — remove featured checkbox
- `admin-panel/src/components/success-cases/SuccessCaseForm.tsx` — remove featured hardcode
- `admin-panel/src/pages/services/ServicesList.tsx` — remove handleToggleFeatured
- `admin-panel/src/pages/success-cases/SuccessCasesList.tsx` — remove handleToggleFeatured
