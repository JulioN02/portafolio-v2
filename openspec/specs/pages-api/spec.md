# Spec: Pages API — Real database-backed SiteSection management

## Description

Replace the current localStorage-based site section management (`useSiteSections` hook) with a proper Prisma model, REST API CRUD + reorder endpoints, and connected admin UI. This provides persistent, shared state across admin sessions and enables the homepage to render sections in the correct order with visibility control.

## Requirements

### 1. Prisma Schema: Create `SiteSection` model
- **Given** no site section model exists in `api/prisma/schema.prisma`
- **When** creating the model
- **Then** a new model is added:

```prisma
model SiteSection {
  id        String   @id @default(cuid())
  sectionId String   // e.g. "services", "products", "tools", "success-cases"
  label     String   // e.g. "Services", "Products", etc.
  enabled   Boolean  @default(true)
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([sectionId])
  @@index([order])
}
```

- **And** the `@@unique([sectionId])` constraint prevents duplicate section entries
- **And** `order` is kept for this model (necessary for section reordering)

### 2. Shared Zod Schemas: Create `SiteSection` schemas
- **Given** `packages/shared/src/schemas/` contains entity schemas
- **When** adding SiteSection
- **Then** a new file `siteSection.schema.ts` is created with:
  - `siteSectionSchema` — validates `sectionId` (string min 2), `label` (string min 2), `enabled` (boolean, default true), `order` (number int min 0, default 0)
  - `siteSectionUpdateSchema` — partial of siteSectionSchema
  - `siteSectionReorderSchema` — `z.object({ sections: z.array(z.object({ id: z.string(), order: z.number().int().min(0) })) })`
  - `SiteSectionInput`, `SiteSectionUpdateInput`, `SiteSectionReorderInput` type exports
  - `SiteSectionResponse` interface
- **And** `index.ts` exports the new schemas

### 3. API Service Layer: Create `siteSection.service.ts`
- **Given** `api/src/services/` contains entity services
- **When** creating SiteSection service
- **Then** `siteSection.service.ts` is created with:
  - `findAll()` — returns all sections ordered by `order` asc
  - `findById(id)` — get single section
  - `create(data)` — create section, auto-assign next available order
  - `update(id, data)` — update label, enabled, or sectionId
  - `softDelete(id)` — remove section (hard delete is acceptable since these are admin-managed, but soft delete preferred for consistency)
  - `reorder(sections)` — accepts array of `{ id, order }` and updates all in transaction
  - Default seed data: services, products, tools, success-cases with enabled=true on creation

### 4. API Controller Layer: Create `siteSection.controller.ts`
- **Given** `api/src/controllers/` contains entity controllers
- **When** creating SiteSection controller
- **Then** `siteSection.controller.ts` is created with handlers for:
  - `findAll` — GET returns all sections
  - `findById` — GET single section
  - `create` — POST creates new section
  - `update` — PUT updates section
  - `delete` — DELETE removes section
  - `reorder` — PATCH bulk reorder sections
- **And** handlers follow the same Zod validation + error handling pattern as existing controllers

### 5. API Routes Layer: Create `siteSection.routes.ts`
- **Given** `api/src/routes/` contains entity routes
- **When** creating SiteSection routes
- **Then** `siteSection.routes.ts` is created with:
  - `GET /` — findAll (public, auth not required — homepage needs this)
  - `GET /:id` — findById (public)
  - `POST /` — create (auth middleware)
  - `PUT /:id` — update (auth middleware)
  - `DELETE /:id` — delete (auth middleware)
  - `PATCH /reorder` — reorder (auth middleware)
- **And** routes are registered in the main Express app

### 6. API App Registration
- **Given** the main Express app registers routes
- **When** adding SiteSection routes
- **Then** `api/src/app.ts` (or equivalent) registers `siteSectionRoutes` at `/site-sections`

### 7. Admin Panel API Client: Create `siteSections.api.ts`
- **Given** `admin-panel/src/api/` contains entity API clients
- **When** creating SiteSection API client
- **Then** `siteSections.api.ts` is created with:
  - `getAll()` → `GET /site-sections`
  - `getById(id)` → `GET /site-sections/:id`
  - `create(data)` → `POST /site-sections`
  - `update(id, data)` → `PUT /site-sections/:id`
  - `delete(id)` → `DELETE /site-sections/:id`
  - `reorder(sections)` → `PATCH /site-sections/reorder`

### 8. Admin Panel Hooks: Create `useSiteSectionsApi` hook (replace localStorage)
- **Given** `admin-panel/src/hooks/useSiteSections.ts` currently uses localStorage
- **When** replacing with API-based hook
- **Then** a new hook (or the same file renamed to `useSiteSectionsApi`) is created that:
  - Uses TanStack Query's `useQuery` to fetch sections from API
  - Uses `useMutation` for create/update/delete/reorder
  - Provides the same interface: `sections`, `toggleSection`, `moveSection` (via reorder mutation), `addSection` (via create mutation), `removeSection` (via delete mutation)
  - Invalidates query cache on mutations
  - Maintains loading state similar to current `isLoaded`
- **And** the old `useSiteSections.ts` localStorage implementation is replaced (remove `useState` + `useEffect` + `localStorage` pattern)

### 9. Admin Panel UI: Update `PagesList.tsx` to use API
- **Given** `admin-panel/src/pages/pages/PagesList.tsx` uses `useSiteSections()` with localStorage
- **When** connecting to API
- **Then** `PagesList.tsx` is updated to:
  - Use the new API-based hook
  - Show loading/error states from React Query
  - Keep the same visual layout (table with arrows, toggle, add section form)
  - Replace `saveSections` with mutation-based persistence
  - Update the info banner text (remove "Los cambios se guardan localmente" message)

### 10. Prisma Seed: Add default SiteSections
- **Given** the seed script at `api/prisma/seed.ts`
- **When** adding SiteSection model
- **Then** the seed script creates 4 default sections: services, products, tools, success-cases

### 11. Public API: Homepage endpoint
- **Given** the homepage needs to render sections in correct order
- **When** the public client or recruiter frontend calls the API
- **Then** a public endpoint `GET /site-sections` returns all enabled sections ordered by `order` asc
- **And** the response format matches what the frontend expects (array of `{ sectionId, label, enabled, order }`)

## Acceptance Criteria
- [ ] Prisma migration creates SiteSection table
- [ ] CRUD API endpoints work for SiteSection
- [ ] Reorder endpoint works with bulk update in transaction
- [ ] Admin Pages UI loads from API instead of localStorage
- [ ] Adding/removing/reordering sections persists to DB
- [ ] Public `GET /site-sections` endpoint returns sections
- [ ] TypeScript 0 errors
- [ ] Seed creates default sections
- [ ] localStorage migration: existing data is NOT auto-migrated (but admin can recreate sections)

## Affected Files
- `api/prisma/schema.prisma` — add SiteSection model
- `packages/shared/src/schemas/siteSection.schema.ts` — new file
- `packages/shared/src/schemas/index.ts` — export SiteSection schemas
- `api/src/services/siteSection.service.ts` — new file
- `api/src/controllers/siteSection.controller.ts` — new file
- `api/src/routes/siteSection.routes.ts` — new file
- `api/src/app.ts` — register siteSection routes
- `api/prisma/seed.ts` — add default SiteSections
- `admin-panel/src/api/siteSections.api.ts` — new file
- `admin-panel/src/hooks/useSiteSections.ts` — replace with API-based implementation
- `admin-panel/src/pages/pages/PagesList.tsx` — connect to API hook
- `admin-panel/src/i18n/translations.ts` — update pages.info text
