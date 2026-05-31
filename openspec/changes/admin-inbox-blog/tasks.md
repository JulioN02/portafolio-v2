# Tasks: Admin Inbox Redesign + Blog Filters

## Phase A: Shared Layer

- [ ] **A1** `packages/shared/src/schemas/contact.schema.ts` — Add `readAt`, `archived`, `labels` to `ContactFormResponse`; create `contactFormFilterSchema` with search/isRead/isArchived/label/page/limit; export `ContactFormFilterInput` type
- [ ] **A2** `packages/shared/src/schemas/blogPost.schema.ts` — Add `search: z.string().optional()` to `blogPostFilterSchema`
- [ ] **A3** `packages/shared/src/types/index.ts` — Export new types: `ContactFormFilterInput`, `ContactFilterInput`

## Phase B: Data Layer

- [ ] **B1** `api/prisma/schema.prisma` — Add `readAt DateTime?`, `archived Boolean @default(false)`, `labels String[]` to ContactForm model; add `@@index([readAt])` and `@@index([archived, readAt])`
- [ ] **B2** `npx prisma db push --accept-data-loss` — Apply schema changes to PostgreSQL

## Phase C: API Layer

- [ ] **C1** `api/src/services/contact.service.ts` — Update `CONTACT_SELECT` to include readAt/archived/labels; enhance `findAll` with search (contains+insensitive on firstName/lastName/email/message), isRead, isArchived, label filters; add `markAsRead`, `toggleArchive`, `setLabels` methods
- [ ] **C2** `api/src/controllers/contact.controller.ts` — Add handlers for `markAsRead`, `toggleArchive`, `setLabels`; update `findAll` to parse new query params (search, isRead, isArchived, label)
- [ ] **C3** `api/src/routes/contact.routes.ts` — Add `PATCH /:id/read`, `PATCH /:id/archive`, `POST /:id/labels` before `/:id` routes
- [ ] **C4** `api/src/services/blog-post.service.ts` — Update `findAll` to support `search` param (contains+insensitive on title/shortDescription/body)

## Phase D: Admin UI — Inbox

- [ ] **D1** `admin-panel/src/api/contactForms.api.ts` — Add `markAsRead`, `toggleArchive`, `setLabels` methods; update `getAll` with search/isRead/isArchived/label/page/limit params
- [ ] **D2** `admin-panel/src/hooks/useContactForms.ts` — Add `useMarkAsRead`, `useToggleArchive`, `useSetLabels` mutations; update `useGetAll` queryKey to include all filters
- [ ] **D3** Rewrite `admin-panel/src/pages/contact-messages/ContactMessagesList.tsx` — Split-view container with search (300ms debounce), filter chips (All/Unread/Read/Archived), URL param sync, stats cards, pagination driven by API
- [ ] **D4** Rewrite `admin-panel/src/components/contact-messages/ContactMessageList.tsx` — Left panel: scrollable list with unread indicators, archive button per item, label badges, selected state styling
- [ ] **D5** Rewrite `admin-panel/src/pages/contact-messages/ContactMessageDetail.tsx` — Right panel/detail drawer: auto mark-as-read on mount, archive/label actions, sender info, full message body
- [ ] **D6** Create `admin-panel/src/pages/contact-messages/Inbox.module.css` — CSS modules for split-view layout, responsive breakpoints at 768px
- [ ] **D7** `admin-panel/src/i18n/translations.ts` — Add translation keys for archive/labels/search/filter chips

## Phase E: Blog Frontend Filters

- [ ] **E1** `client-site/src/hooks/useBlogPosts.ts` — Accept `category` and `search` params, add to queryKey
- [ ] **E2** `client-site/src/pages/Blog/index.tsx` — Add search input (300ms debounce) + category dropdown, sync to URL params
- [ ] **E3** `recruiter-site/src/hooks/useBlogPosts.ts` — Accept `category` and `search` params, add to queryKey
- [ ] **E4** `recruiter-site/src/pages/BlogPage.tsx` + `BlogGrid.tsx` — Add search input + category dropdown, URL param sync, pass to hook

## Phase F: Verification

- [ ] **F1** `npx tsc --noEmit` — Typecheck all packages; fix type errors
- [ ] **F2** Build all frontends (admin-panel, client-site, recruiter-site) — verify successful compilation
