# Tasks: Admin Inbox Extras — Starred Messages, Delete UI & Filter Composition

Implementation order follows dependency chain: schema → shared types → API → frontend → verify.

## Phase A: Data Layer

- [x] A1: Add `starred Boolean @default(false)` to `ContactForm` model in `api/prisma/schema.prisma`
- [x] A2: Add `@@index([starred, createdAt])` to `ContactForm` model in `api/prisma/schema.prisma`
- [x] A3: Run `npx prisma db push --accept-data-loss` to apply schema changes

## Phase B: Shared Schemas

- [x] B1: Add `isStarred: z.coerce.boolean().optional()` to `contactFormFilterSchema` and `starred: boolean` to `ContactFormResponse` in `packages/shared/src/schemas/contact.schema.ts`

## Phase C: API Layer

- [x] C1: Add `starred` field to `CONTACT_SELECT` constant in `api/src/services/contact.service.ts`
- [x] C2: Add `isStarred` condition in `findAll` Prisma where builder (ANDs automatically with existing filters)
- [x] C3: Add `toggleStar(id)` method to contact service — reads current value, flips it, returns updated record
- [x] C4: Add `toggleStar` handler to `api/src/controllers/contact.controller.ts` — validates ID, calls service, returns response
- [x] C5: Add `PATCH /:id/star` route to `api/src/routes/contact.routes.ts` (before `/:id` catch-all)

## Phase D: Frontend

- [x] D1: Add `toggleStar(id: string)` to `admin-panel/src/api/contactForms.api.ts` calling `PATCH /contact/:id/star`
- [x] D2: Add `useToggleStar` mutation to `admin-panel/src/hooks/useContactForms.ts` — invalidates `['contactForms']` on success
- [x] D3: Add `starred` to `ContactMessage` interface, star button (★/☆) to `ContactMessageList` items, and star toggle in `ContactMessageDetail` header actions
- [x] D4: Add `isStarred` to apiFilters and "Destacados" filter chip in `ContactMessagesList.tsx` page
- [x] D5: Add delete button to `ContactMessageList` items and `ContactMessageDetail` using `ConfirmDeleteModal` — manage `deleteTarget` state, wire `useDelete`, deselect on delete
- [x] D6: Add i18n keys `contactMessages.starred`, `contactMessages.star`, `contactMessages.unstar` in both ES and EN translations

## Phase E: Verification

- [x] E1: Run `npx tsc --noEmit` across all packages to verify type correctness
- [x] E2: Run unit + integration tests for API layer and frontend
