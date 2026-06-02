# Design: Admin Inbox Extras — Starred Messages, Delete UI & Filter Composition

## Overview

Technical design for three inbox enhancements: starred/destacados messages (full stack — Prisma to UI), delete-from-UI (API already exists), and composition of the `isStarred` filter with existing filters. Follows the same layered approach as the existing inbox design: Prisma → shared schema → API service → API routes → frontend API → hook → UI.

**Specs Grounding**: [01-starred-messages.md](../specs/01-starred-messages.md), [02-delete-ui.md](../specs/02-delete-ui.md)

---

## Architecture Decisions

### Decision: Star — Toggle (not separate set/unset)
**Choice**: Single `PATCH /:id/star` endpoint that reads current value, flips it, returns the new state.
**Alternatives**: Two endpoints (`PUT /:id/star`, `DELETE /:id/star`); endpoint that accepts `{ starred: boolean }` body.
**Rationale**: Matches the existing `toggleArchive` pattern — same toggle semantics, same controller structure, same frontend mutation style. Reduces API surface. Idempotency is not required; the client always knows the current state before toggling.

### Decision: Star — Boolean field, not separate table
**Choice**: `starred Boolean @default(false)` on the `ContactForm` model.
**Alternatives**: Separate `StarredMessage` join table; PostgreSQL native `tsvector` with ranking.
**Rationale**: Starred is a simple boolean attribute of a message — no extra metadata, no ordering beyond `createdAt`. A boolean column is the simplest, most efficient representation. The existing `featured` field on `Product` and `Tool` models confirms this pattern.

### Decision: Delete — Keep hard delete (existing)
**Choice**: Reuse existing `DELETE /:id` which does `prisma.contactForm.delete()` — hard delete.
**Alternatives**: Soft-delete with `deletedAt`; archive-only flow without delete.
**Rationale**: The endpoint already exists and is used internally. The UI merely exposes it to the admin user. Adding soft-delete would break consistency with the existing implementation. Hard delete is appropriate for contact form data (no relational integrity concerns beyond the single row).

### Decision: Filter Composition — AND via Prisma `where`
**Choice**: Add `isStarred` as another condition in the `findAll` where builder. Prisma automatically ANDs all top-level keys.
**Alternatives**: Separate query for starred; post-filter results in JS.
**Rationale**: The existing where builder already ANDs `isRead`, `isArchived`, `label`, `originType`, and `OR` (search). Adding `starred` is a one-line addition. Prisma's `where` object semantics guarantee correct AND composition. No special handling needed.

### Decision: Delete Modal — Reuse ConfirmDeleteModal
**Choice**: Same `ConfirmDeleteModal` component used elsewhere in the admin panel.
**Alternatives**: Custom inline confirmation; custom modal.
**Rationale**: The component already accepts `isOpen`, `title`, `entityName`, `onConfirm`, `onCancel`, and `isLoading` — exactly what is needed. No new component required.

### Decision: Standalone Mobile Delete — Navigate back after delete
**Choice**: On the standalone `ContactMessageDetailPage` (mobile route), delete navigates back to `/contact-messages` after success.
**Alternatives**: Stay on page and show "deleted" state.
**Rationale**: The message no longer exists — there is nothing to show. Navigating back to the list is the natural UX, matching the spec requirement.

---

## Data Flow Diagrams

### Star Toggle Flow

```
User clicks ★ icon       useToggleStar.mutate(id)     PATCH /contact/:id/star
      │                         │                            │
      ▼                         ▼                            ▼
  StarIcon (optimistic) →  Query invalidation  →  Service reads current starred
                                                       value, toggles it
                                                            │
      ◄────────────────────── Refetch list ◄──────── Response { starred: true/false }
```

### Delete Flow

```
User clicks 🗑️ icon    setDeleteTarget(message)    ConfirmDeleteModal opens
      │                         │                         │
      ▼                         ▼                         ▼
  Icon button →  Store target id + name →  Modal with entityName, [Cancel] [Eliminar]
                                                   │
                                              User confirms
                                                   │
                                                   ▼
                                          useDelete.mutate(id)
                                                   │
                                          ┌────────┴────────┐
                                          ▼                  ▼
                                    Success (200)       Error (4xx/5xx)
                                          │                  │
                                          ▼                  ▼
                                    Remove from list    Modal stays open
                                    Deselect if active  User can retry
```

### Filter Composition Matrix

```
URL params                     Prisma WHERE (AND of all present)
─────────────────────────────────────────────────────────────────
?filter=starred                { starred: true }
?filter=starred&filter=unread  { starred: true, readAt: null }
?filter=starred&search=urgent  { starred: true, OR: [{message: {contains: "urgent"}}] }
?filter=starred&label=bug      { starred: true, labels: { has: "bug" } }
?filter=starred&originType=CLIENT  { starred: true, originType: "CLIENT" }
?filter=starred&filter=archived    { starred: true, archived: true }
```

---

## File Changes

### Schema & API Layer

| File | Action | Grounded In |
|------|--------|------------|
| `api/prisma/schema.prisma` | Modify | Add `starred Boolean @default(false)` + `@@index([starred, createdAt])` to ContactForm |
| `packages/shared/src/schemas/contact.schema.ts` | Modify | Add `starred: boolean` to `ContactFormResponse`; add `isStarred: z.coerce.boolean().optional()` to `contactFormFilterSchema` |
| `api/src/services/contact.service.ts` | Modify | Add `isStarred` to `ContactFilterInput`; add `toggleStar(id)` method; add `starred` to `CONTACT_SELECT`; add `starred` condition in `findAll` where builder |
| `api/src/controllers/contact.controller.ts` | Modify | Add `toggleStar` handler; parse `isStarred` query param in `findAll` |
| `api/src/routes/contact.routes.ts` | Modify | Add `PATCH /:id/star` route before `/:id` |

### Frontend Layer

| File | Action | Grounded In |
|------|--------|------------|
| `admin-panel/src/api/contactForms.api.ts` | Modify | Add `toggleStar(id)`; add `isStarred` to `getAll` params |
| `admin-panel/src/hooks/useContactForms.ts` | Modify | Add `useToggleStar` mutation (invalidates `['contactForms']`) |
| `admin-panel/src/components/contact-messages/ContactMessageList.tsx` | Modify | Add `starred` to `ContactMessage` interface; add star button (★/☆) per item; add delete button per item; add `onToggleStar` and `onDelete` props; integrate `ConfirmDeleteModal` |
| `admin-panel/src/pages/contact-messages/ContactMessagesList.tsx` | Modify | Add `isStarred` to `apiFilters`; add "Destacados" chip; map `starred` in `mapToContactMessage`; wire `handleToggleStar` and `handleDelete`; manage delete modal state; deselect on delete |
| `admin-panel/src/pages/contact-messages/ContactMessageDetail.tsx` | Modify | Add star toggle button in header actions; add delete button in header actions; integrate `ConfirmDeleteModal`; on delete success navigate to `/contact-messages` |
| `admin-panel/src/i18n/translations.ts` | Modify | Add `contactMessages.starred`, `contactMessages.star`, `contactMessages.unstar` |

---

## UI Architecture Changes

### Filter Chip — New "Destacados" Entry

```typescript
// Current filters
type MessageFilter = 'all' | 'unread' | 'read' | 'archived';

// New filter option
type MessageFilter = 'all' | 'unread' | 'read' | 'archived' | 'starred';
```

The `apiFilters` builder in `ContactMessagesListPage` gains a new condition:

```typescript
if (currentFilter === 'starred') {
  filters.isStarred = true;
}
```

The "Destacados" chip behaves as a toggle in the filter bar. When active, it composes with other active chips via AND — same as all other chips.

### ContactMessage Interface — New Fields

```typescript
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  archived: boolean;
  starred: boolean;       // NEW
  labels: string[];
  source: string;
}
```

### ContactMessageList — New Props

```typescript
interface ContactMessageListProps {
  messages: ContactMessage[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onArchive?: (id: string) => void;
  onToggleStar?: (id: string) => void;  // NEW
  onDelete?: (message: ContactMessage) => void;  // NEW
}
```

### Star Icon Rendering

Each message row shows a star button (left-aligned, before the content):

```html
<button onClick={(e) => { e.stopPropagation(); onToggleStar?.(message.id); }}>
  {message.starred ? '★' : '☆'}
</button>
```

★ when starred (filled, gold color `#f59e0b`), ☆ when not (outline, muted `#d1d5db`).

### Detail Panel — New Action Buttons

The header action area in both the split-view detail panel and the standalone detail page gains two buttons:
1. **Star toggle** — same ★/☆ icon, toggles via `useToggleStar`
2. **Delete** — 🗑️ or "Eliminar" text button, opens `ConfirmDeleteModal`

### Delete State Management

Each page maintains local delete state:
```typescript
const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
```

On confirm: `useDelete().mutate(deleteTarget.id)`. On success: `setDeleteTarget(null)`, and if the deleted item was the selected message, clear selection.

---

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `toggleStar` service | Toggle from false→true and true→false; test NotFoundError for missing ID |
| Unit | `findAll` with `isStarred` | Verify Prisma where clause includes `{ starred: true }`; verify AND composition with `isRead` and `search` |
| Unit | `contactFormFilterSchema` | Verify `isStarred: true` passes validation; verify absence is undefined |
| Integration | `PATCH /:id/star` endpoint | SuperTest: toggle star twice and verify both responses; 404 for missing ID |
| Integration | `GET /contact?isStarred=true` | SuperTest: verify only starred messages returned |
| Integration | `GET /contact?isStarred=true&isRead=false` | SuperTest: verify AND filter returns correct subset |
| E2E | Star toggle from list | Playwright: click star icon, verify visual change, verify persisted on reload |
| E2E | Star toggle from detail | Playwright: open detail, click star, verify state in list |
| E2E | Destacados filter chip | Playwright: click chip, verify only starred messages shown; combine with other chips |
| E2E | Delete from list | Playwright: click delete icon, confirm in modal, verify message removed |
| E2E | Delete from detail | Playwright: open detail, click delete, confirm, verify panel clears |
| E2E | Delete error handling | Playwright: mock 500 on delete, verify modal stays open for retry |

---

## Migration & Rollout

### Migration Steps
1. Run `npx prisma db push` — adds `starred` column (non-breaking, default `false`, not null)
2. Deploy `packages/shared` — new `ContactFormResponse` + `contactFormFilterSchema` fields
3. Deploy API changes — new route, updated service/controller
4. Deploy admin panel frontend — new UI elements

### Rollback
1. `git revert` frontend changes
2. `git revert` API + schema changes
3. `npx prisma db push` with previous schema — `starred` column is additive, data preserved, no code references it

---

## Open Questions

- [ ] Should the "Destacados" filter chip be mutually exclusive with other filter chips, or freely composable? (Design assumes composable AND logic — same as existing chips)
- [ ] Confirmation needed: the existing `ConfirmDeleteModal` uses `{entity}` in the translation key — does the admin panel translation for `common.deleteConfirm` work correctly with the entity name interpolation?

---

## Decision Log

| Decision | Chosen | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Star toggle pattern | Single toggle endpoint | Separate set/unset endpoints | Matches `toggleArchive` pattern |
| Star storage | Boolean column on ContactForm | Separate join table | Simple, efficient, proven pattern |
| Delete strategy | Hard delete (existing API) | Soft-delete with `deletedAt` | Consistent with current implementation |
| Filter composition | Prisma `where` AND | Post-filter in JS | No special logic needed — Prisma ANDs naturally |
| Delete confirmation | Existing ConfirmDeleteModal | New custom modal | Component already fits all requirements |
| Mobile post-delete UX | Navigate back to list | Show "deleted" state | Natural UX — nothing left to show |
