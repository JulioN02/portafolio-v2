# Design: Admin Inbox + Blog Frontend Filters

## Overview

Technical design for a Gmail-like admin inbox (read tracking, archiving, labels, search, split-view UI) and blog search/filter capabilities on both client-site and recruiter-site. Also fixes the pagination bug where ContactMessagesList did not pass filter/page params to the API.

## Technical Approach

The implementation follows a layered approach: Prisma schema → shared Zod schemas → API service/controller → frontend API layer → React Query hooks → UI components. Each layer is updated to support the new fields and filtering capabilities before the next.

### Execution Order
1. **Prisma schema** — add `readAt`, `archived`, `labels` to ContactForm model
2. **Shared schemas** — extend `ContactFormResponse`, `contactFilterSchema`, `blogPostFilterSchema`
3. **API services** — new methods + enhanced findAll with search/filters
4. **API controllers/routes** — new endpoints
5. **Admin API layer** — new API methods, updated hooks with mutations
6. **Admin Inbox UI** — split-view redesign
7. **Client-site Blog** — search + category filter
8. **Recruiter-site Blog** — search + category filter

---

## Architecture Decisions

### Decision: ContactForm Read Tracking
**Choice**: Add `readAt DateTime?` field (null = unread, Date = read)
**Alternatives**: Separate `isRead Boolean` field; join table for read receipts
**Rationale**: `readAt` encodes both the read state AND the timestamp — null means unread, a Date means read and tells us when. Avoids an extra boolean + timestamp pair. Set automatically when the message detail is opened.

### Decision: ContactForm Archive
**Choice**: Add `archived Boolean @default(false)`
**Alternatives**: Soft-delete with `deletedAt`; move to separate table
**Rationale**: Simple boolean flag. Archived messages should still appear in filtered views, not be hidden like deleted content. Users can toggle archive on/off. No data loss risk.

### Decision: Label System
**Choice**: `labels String[]` on ContactForm (PostgreSQL native array)
**Alternatives**: Separate Label + MessageLabel join tables
**Rationale**: Labels are simple strings per message with no predefined taxonomy needed. PostgreSQL arrays are efficient for this use case. No need for normalized labels when the admin doesn't manage a label vocabulary.

### Decision: Contact Search Implementation
**Choice**: Prisma `contains` + `mode: 'insensitive'` on `firstName`, `lastName`, `email`, `message` fields (OR logic)
**Alternatives**: Full-text search with PostgreSQL `tsvector`; raw `ILIKE` query
**Rationale**: The contact message volume is low (hundreds, not millions). `contains` with `insensitive` mode is simple, portable, and needs no raw SQL. Full-text search would be over-engineering. Risk identified in proposal (Prisma String[] search) does not apply here — the search fields are individual String columns, not the labels array.

### Decision: Blog Search Implementation
**Choice**: Prisma `contains` + `mode: 'insensitive'` on `title`, `shortDescription`, and `body` (OR logic)
**Alternatives**: Full-text search; client-side filtering
**Rationale**: Same reasoning as contact search. Blog volume is also modest. The OR logic across three fields provides good discoverability.

### Decision: Inbox Layout
**Choice**: Split view (desktop) — left panel message list, right panel detail/preview; stacked (mobile) — list → tap → detail with back navigation
**Alternatives**: Always stacked (current); always split on all sizes
**Rationale**: Gmail-like pattern. Desktop split view maximizes productivity for the admin. Mobile stacked provides a native-feeling navigation. CSS media queries toggle between layouts.

### Decision: Filter State Management
**Choice**: URL query params for filters + search; React Query for server data
**Alternatives**: React state only; Zustand/Redux
**Rationale**: URL params make filters shareable, bookmarkable, and survive refresh. React Query handles server state, caching, and invalidation. No global state library needed — filter state is local to the inbox page.

### Decision: Search Debounce
**Choice**: 300ms debounce
**Alternatives**: 150ms; 500ms; on-enter only
**Rationale**: 300ms is the UX standard — feels instant to users while avoiding excessive API calls on every keystroke.

### Decision: Pagination Fix
**Choice**: Pass `page` and `limit` from URL params to API instead of client-side filtering
**Alternatives**: Keep client-side filtering but fetch all data
**Rationale**: Current code fetches all messages (no page/limit), then filters on client. This breaks with large datasets. Fix: always send `page`, `limit`, and all filter params to the API.

---

## Data Flow

### Inbox Flow
```
User Action              URL Param Change     React Query          API                 DB
─────────────────────────────────────────────────────────────────────────────────────────
Select filter chip    →  ?filter=unread    →  invalidate query  →  GET /contact?       →  WHERE readAt IS NULL
Type in search        →  ?search=john      →  debounce 300ms   →  GET /contact?       →  WHERE firstName ILIKE '%john%'
Click message         →  ?selected=msg123  →  (local state)    →  PATCH /contact/:id  →  SET readAt = now()
Click archive         →  (no URL change)   →  mutation         →  PATCH /contact/:id  →  SET archived = true
Add label             →  (no URL change)   →  mutation         →  POST /contact/:id   →  SET labels = [...]
Change page           →  ?page=2           →  invalidate query  →  GET /contact?page=2 →  OFFSET 10 LIMIT 10
```

### Blog Filter Flow
```
User Action              URL Param Change     React Query          API                 DB
─────────────────────────────────────────────────────────────────────────────────────────
Select category       →  ?category=dev     →  invalidate query  →  GET /blog-posts?    →  WHERE category = 'dev'
Type search           →  ?search=react     →  debounce 300ms   →  GET /blog-posts?    →  WHERE title ILIKE '%react%'
Change page           →  ?page=2           →  invalidate query  →  GET /blog-posts?    →  OFFSET 9 LIMIT 9
```

---

## Data Model Changes

### ContactForm (Prisma)
```prisma
model ContactForm {
  id          String      @id @default(cuid())
  firstName   String
  lastName    String?
  whatsapp    String?
  email       String
  message     String
  source      String
  originType  FormOrigin
  readAt      DateTime?                     // NEW: null = unread, Date = read
  archived    Boolean     @default(false)   // NEW
  labels      String[]                      // NEW: PostgreSQL text array

  createdAt   DateTime @default(now())

  @@index([originType, createdAt])
  @@index([readAt])
  @@index([archived, readAt])
}
```

### ContactFormResponse (shared schema)
```typescript
export interface ContactFormResponse {
  id: string;
  firstName: string;
  lastName: string | null;
  whatsapp: string | null;
  email: string;
  message: string;
  source: string;
  originType: FormOrigin;
  readAt: string | null;     // NEW
  archived: boolean;          // NEW
  labels: string[];           // NEW
  createdAt: Date;
}
```

### ContactFilterInput (shared schema — Zod)
```typescript
export const contactFilterSchema = z.object({
  search: z.string().optional(),
  isRead: z.coerce.boolean().optional(),
  isArchived: z.coerce.boolean().optional(),
  label: z.string().optional(),
  originType: formOriginEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
```

### blogPostFilterSchema (shared schema)
```typescript
export const blogPostFilterSchema = z.object({
  status: postStatusEnum.optional(),
  category: z.string().optional(),
  search: z.string().optional(),       // NEW
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
```

---

## API Changes

### Contact Endpoints

| Method | Path | Body/Params | Response | Description |
|--------|------|-------------|----------|-------------|
| `GET` | `/api/contact` | `?search=&isRead=&isArchived=&label=&originType=&page=&limit=` | `{ data, pagination }` | Enhanced with search and boolean filters |
| `PATCH` | `/api/contact/:id/read` | — | `{ readAt: Date }` | Marks message as read (sets `readAt` to now) |
| `PATCH` | `/api/contact/:id/archive` | — | `{ archived: boolean }` | Toggles archive status |
| `POST` | `/api/contact/:id/labels` | `{ labels: string[] }` | `{ labels: string[] }` | Replaces all labels for the message |

### Blog Endpoints

| Method | Path | Params | Description |
|--------|------|--------|-------------|
| `GET` | `/api/blog-posts` | `?search=&category=&status=&page=&limit=` | Enhanced with `search` param (already has category+status) |

### Contact Service — `findAll` Where Builder

```
where = {
  ...(search && {
    OR: [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
    ]
  }),
  ...(isRead !== undefined && {
    readAt: isRead ? { not: null } : null
  }),
  ...(isArchived !== undefined && { archived: isArchived }),
  ...(label && { labels: { has: label } }),
  ...(originType && { originType }),
}
```

### Blog Service — `findAll` Where Builder

```
where = {
  deletedAt: null,
  ...(status && { status }),
  ...(category && { category }),
  ...(search && {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
      { body: { contains: search, mode: 'insensitive' } },
    ]
  }),
}
```

### Routes

**Contact routes** — add before existing `/:id` to avoid param conflicts:
```typescript
// NEW — must be before /:id
router.patch('/:id/read', authMiddleware, contactController.markAsRead);
router.patch('/:id/archive', authMiddleware, contactController.toggleArchive);
router.post('/:id/labels', authMiddleware, contactController.setLabels);

// EXISTING
router.get('/', authMiddleware, contactController.findAll);
router.get('/stats/summary', authMiddleware, contactController.getStats);
router.get('/:id', authMiddleware, contactController.findById);
router.delete('/:id', authMiddleware, contactController.delete);
```

**Blog routes** — no new routes needed. The `/categories` route already exists. Only the `findAll` handler logic changes.

---

## File Changes

### Phase 1: Schema + API Layer

| File | Action | Grounded In |
|------|--------|-------------|
| `api/prisma/schema.prisma` | Modify | Add `readAt`, `archived`, `labels` to ContactForm |
| `packages/shared/src/schemas/contact.schema.ts` | Modify | Add fields to `ContactFormResponse`, add `contactFilterSchema` |
| `packages/shared/src/schemas/blogPost.schema.ts` | Modify | Add `search` to `blogPostFilterSchema` |
| `api/src/services/contact.service.ts` | Modify | New methods: `markAsRead`, `toggleArchive`, `setLabels`; update `findAll` with search/filter params; update `CONTACT_SELECT`; update `ContactFilterInput` |
| `api/src/controllers/contact.controller.ts` | Modify | New handlers: `markAsRead`, `toggleArchive`, `setLabels`; update `findAll` to parse new query params |
| `api/src/routes/contact.routes.ts` | Modify | Add 3 new routes before `/:id` |
| `api/src/services/blog-post.service.ts` | Modify | Update `findAll` to handle `search` param |

### Phase 2: Admin Inbox Frontend

| File | Action | Grounded In |
|------|--------|-------------|
| `admin-panel/src/api/contactForms.api.ts` | Modify | Add `markAsRead`, `toggleArchive`, `setLabels` methods; update `getAll` with new params |
| `admin-panel/src/hooks/useContactForms.ts` | Modify | Add mutations: `useMarkAsRead`, `useArchive`, `useSetLabels`; update `useGetAll` filters |
| `admin-panel/src/components/contact-messages/ContactMessageList.tsx` | Rewrite | Become left panel — filter bar (search input, filter chips), scrollable message list, archive button per item, selected state |
| `admin-panel/src/pages/contact-messages/ContactMessagesList.tsx` | Rewrite | Become split-view container — manages URL params, couples list + detail panels, responsive layout |
| `admin-panel/src/pages/contact-messages/ContactMessageDetail.tsx` | Rewrite | Become right panel / detail drawer — accept message prop or fetch by ID, auto mark read on mount, archive/label actions |
| `admin-panel/src/routes/AppRoutes.tsx` | Modify | Update `/contact-messages/:id` route — keep for mobile deep-linking |
| `admin-panel/src/i18n/translations.ts` | Modify | Add translation keys for archive, labels, search, filter chips |
| `admin-panel/src/pages/contact-messages/Inbox.module.css` | Create | Styles for split-view layout |

### Phase 3: Blog Frontend Filters

| File | Action | Grounded In |
|------|--------|-------------|
| `client-site/src/hooks/useBlogPosts.ts` | Modify | Accept `search` and `category` params, add to queryKey |
| `client-site/src/pages/Blog/index.tsx` | Modify | Add search input + category dropdown + URL param sync |
| `recruiter-site/src/hooks/useBlogPosts.ts` | Modify | Accept `search` and `category` params, add to queryKey |
| `recruiter-site/src/pages/BlogPage.tsx` | Modify | Add search input + category dropdown + URL param sync |
| `recruiter-site/src/components/blog/BlogGrid.tsx` | Modify | Accept search/category as props, pass to hook |

---

## Inbox UI Architecture

### Layout Structure (Desktop)
```
┌──────────────────────────────────────────────────┐
│  Header: "Inbox" (stats)                         │
├───────────────────────────┬──────────────────────┤
│  Filter Bar               │  Detail Panel         │
│  ┌─────────────────┐      │  ┌────────────────┐  │
│  │ 🔍 Search...    │      │  │ Sender info    │  │
│  └─────────────────┘      │  │ Email, WhatsApp│  │
│  [All] [Unread] [Archived]│  │ Date           │  │
│                           │  │                │  │
│  ┌─ Message List ──────┐  │  │ Message body   │  │
│  │ ● John Doe          │  │  │                │  │
│  │   Previe...  12:30  │  │  │ Actions:       │  │
│  │   📎 archived       │  │  │ [Archive] [✏️] │  │
│  │                     │  │  │                │  │
│  │ ○ Jane Smith        │  │  └────────────────┘  │
│  │   Previe...  11:00  │  │                      │
│  └─────────────────────┘  │                      │
│  Pagination controls      │                      │
└───────────────────────────┴──────────────────────┘
```

### Layout Structure (Mobile)
```
┌─────────────────────────────┐
│  Header: "Inbox"            │
├─────────────────────────────┤
│  Filter Bar                 │
│  [All] [Unread] [Archived]  │
│  🔍 Search...               │
├─────────────────────────────┤
│  Message List (scrollable)  │
│  ● John Doe                 │
│    Preview...       12:30   │
│                             │
│  ○ Jane Smith               │
│    Preview...       11:00   │
│                             │
│  ...                        │
├─────────────────────────────┤
│  Pagination                 │
└─────────────────────────────┘

  (Tap message → navigate to /contact-messages/:id)
┌─────────────────────────────┐
│  ← Back      Detail        │
├─────────────────────────────┤
│  Full message view          │
│  [Archive] [Labels]         │
└─────────────────────────────┘
```

### Component Tree
```
AppRoutes
└── ProtectedLayout
    └── InboxPage (new — replaces ContactMessagesListPage)
        ├── InboxFilterBar (search input + filter chips)
        ├── InboxMessageList (left panel)
        │   └── InboxMessageItem (per message row)
        └── InboxMessageDetail (right panel / detail)
            ├── MessageHeader (sender, email, date)
            ├── MessageBody
            └── MessageActions (archive, labels)
```

### State Management
- **URL query params**: `?filter=unread&search=john&page=1&selected=msg123`
  - `filter`: `all`, `unread`, `read`, `archived`
  - `search`: raw search string
  - `page`: current page number
  - `selected`: selected message ID (for split view)
  - Use `useSearchParams` from React Router for read/write
- **React Query**: Server data (messages list, message detail), mutations for read/archive/labels
- **Local state**: None needed beyond what URL params provide

### Key Behaviors
1. **Auto mark as read**: When a message is selected in the detail panel, fire `PATCH /contact/:id/read` immediately (optimistic update via React Query mutation)
2. **Archive toggle**: Click archive button → toggle `archived` boolean → invalidate list query → if current filter doesn't include archived, the item disappears from the list
3. **Search**: On input change, 300ms debounce → update `?search=` URL param → triggers re-fetch via queryKey dependency
4. **Label editing**: Click label icon → inline editor or modal → POST new labels array → update cache

---

## Blog Filter UI

### Client-Site Blog
```
┌──────────────────────────────┐
│  Blog                        │
│                              │
│  🔍 Search articles...       │  ← search input (300ms debounce)
│  [All categories ▼]          │  ← category dropdown
│                              │
│  ┌────┐ ┌────┐ ┌────┐       │
│  │Post│ │Post│ │Post│       │
│  └────┘ └────┘ └────┘       │
│                              │
│  Pagination                  │
└──────────────────────────────┘
```

### Recruiter-Site Blog
Same pattern, integrated into BlogGrid.

### Implementation Details
- **Search input**: Controlled input with `useSearchParams` for URL sync and debounced API calls
- **Category dropdown**: Fetches from existing `GET /api/blog-posts/categories`. "All categories" = no category filter
- **URL params**: `?category=dev&search=react&page=2`
- **Query key**: `['blog-posts', 'published', page, category, search]`
- **Debounce hook**: `useDebounce(value, 300)` — returns debounced value, used to delay URL param update

---

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Contact service new methods | Test `markAsRead`, `toggleArchive`, `setLabels` with mock Prisma |
| Unit | Contact service findAll filters | Test each filter combination (search, isRead, isArchived, label, originType) |
| Unit | Blog service findAll with search | Test `search` param builds correct Prisma where clause |
| Integration | Contact API endpoints | SuperTest tests for each new PATCH/POST endpoint |
| Integration | Blog API search | Test GET /blog-posts?search=... returns filtered results |
| E2E | Inbox split-view | Playwright: verify list renders, filter chips work, detail panel shows on click |
| E2E | Blog filters | Playwright: verify search input filters results, category dropdown works |

---

## Migration & Rollout

### Migration Steps
1. Run `npx prisma db push` to add ContactForm fields (non-breaking — all new fields are optional/nullable)
2. Deploy shared schema package (`packages/shared`)
3. Deploy API changes
4. Deploy admin panel frontend
5. Deploy client-site and recruiter-site frontend changes

### Rollback
1. `git revert` frontend changes
2. `git revert` API + schema changes
3. `npx prisma db push` with previous schema (columns are nullable — data is preserved)
4. Fields in DB will remain but no code references them

---

## Open Questions

- [ ] Should the labels field have a predefined set of allowed values, or fully free-form strings? (Currently designed as free-form)
- [ ] Confirm: the categories endpoint (`GET /api/blog-posts/categories`) is already public — no auth middleware — correct for blog filter usage?
- [ ] Should the archive action in inbox be a toggle (archive → unarchive) or one-way (archive only)?

---

## Decision Log

| Decision | Chosen | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Read tracking | `readAt DateTime?` | `isRead Boolean` + separate timestamp | Null = unread, Date = read AND when |
| Archive | `archived Boolean` | `deletedAt` soft-delete | Archive is reversible, not deletion |
| Labels | `String[]` on ContactForm | Normalized join table | Simple, no taxonomy needed |
| Contact search | Prisma `contains` + `mode: 'insensitive'` | Full-text search, raw ILIKE | Simple, adequate for low volume |
| Blog search | Prisma `contains` + `mode: 'insensitive'` | Full-text search | Same reasoning |
| Inbox layout | Split view (desktop), stacked (mobile) | Always stacked, always split | Gmail-like, responsive |
| Filter state | URL query params | React state, Zustand | Shareable, bookmarkable, survives refresh |
| Debounce | 300ms | 150ms, 500ms, on-enter | UX standard |
