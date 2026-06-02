# Delta: Starred Messages (Destacados)

## Domain

Contact forms admin inbox — star/unstar messages, filter by starred status, star icon in list and detail.

## ADDED Requirements

### Requirement: ContactForm Model — Starred Field

The `ContactForm` Prisma model MUST gain a `starred Boolean @default(false)` field with a composite index on `(starred, createdAt)`.

#### Scenario: Migration adds starred column

- GIVEN the Prisma schema is migrated via `prisma db push`
- WHEN the database is inspected
- THEN the ContactForm table has column `starred` (boolean, not null, default false)

### Requirement: Shared Schema — Starred in Response and Filter

`ContactFormResponse` MUST include `starred: boolean`. `contactFormFilterSchema` MUST gain an optional `isStarred: z.coerce.boolean().optional()` field.

#### Scenario: Response includes starred

- GIVEN a contact form with `starred: true`
- WHEN parsed as `ContactFormResponse`
- THEN `starred` is `true`

#### Scenario: Filter accepts isStarred

- GIVEN a filter input `{ isStarred: true }`
- WHEN validated against `contactFormFilterSchema`
- THEN validation passes and `isStarred` is present

### Requirement: API — Toggle Star Endpoint

The API MUST expose `PATCH /api/contact/:id/star` (protected) that toggles the `starred` field. `GET /api/contact` MUST support query param `isStarred` (boolean) that filters by the `starred` field.

#### Scenario: Toggle star

- GIVEN contact with id exists and `starred` is `false`
- WHEN a PATCH request is sent to `/api/contact/:id/star`
- THEN response returns contact with `starred: true`
- WHEN sent again
- THEN response returns contact with `starred: false`

#### Scenario: Filter by isStarred

- GIVEN some contacts are starred and others are not
- WHEN `GET /api/contact?isStarred=true` is called
- THEN only starred contacts are returned
- WHEN `isStarred=false`
- THEN only non-starred contacts are returned

### Requirement: Filter Composition — AND Logic

The `isStarred` filter MUST combine with `isRead`, `isArchived`, `search`, and `label` using AND logic in a single Prisma `where` clause.

#### Scenario: Starred + unread combined

- GIVEN contacts with various read/starred combinations
- WHEN `GET /api/contact?isStarred=true&isRead=false` is called
- THEN only unread AND starred contacts are returned

#### Scenario: Starred + search combined

- GIVEN contacts with various messages
- WHEN `GET /api/contact?isStarred=true&search=urgent` is called
- THEN only starred contacts whose fields match "urgent" are returned

### Requirement: Frontend API and Hook

The admin API client MUST expose `toggleStar(id: string)` calling `PATCH /api/contact/:id/star`. The hook `useContactForms` MUST expose `useToggleStar` mutation that invalidates `['contactForms']` queries on success.

#### Scenario: useToggleStar mutation works

- GIVEN the contact forms hook is used
- WHEN `useToggleStar().mutate(id)` is called
- THEN a PATCH request to `/contact/:id/star` is sent
- AND contact form queries are invalidated

### Requirement: UI — Star Icon on List Items

Each message in `ContactMessageList` MUST show a star icon (filled ★ when starred, outline ☆ when not). Clicking the icon MUST toggle the starred state without navigating.

#### Scenario: Star toggle from list item

- GIVEN a message in the list with `starred: false`
- WHEN the user clicks the star icon
- THEN the system calls `PATCH /contact/:id/star`
- AND the icon changes to filled state
- WHEN clicked again
- THEN star is untoggled and icon returns to outline

#### Scenario: Star toggle from detail panel

- GIVEN user views a message in the detail panel
- WHEN user clicks the star icon in the header
- THEN the system calls `PATCH /contact/:id/star`
- AND the star state updates reactively

### Requirement: UI — "Destacados" Filter Chip

The filter bar in `ContactMessagesList` MUST include a "Destacados" (Starred) chip that sets `isStarred=true`. This chip MUST compose with other active filters via AND logic.

#### Scenario: Starred filter chip activates

- GIVEN user is on the inbox page
- WHEN user clicks the "Destacados" filter chip
- THEN the API is called with `isStarred=true`
- AND only starred messages are shown
- WHEN clicked again
- THEN the filter is removed

#### Scenario: Starred + other filter chips combine

- GIVEN user has "Destacados" and "No leídos" active
- WHEN the API is called
- THEN `isStarred=true&isRead=false` is sent
- AND results match BOTH conditions

### Requirement: Translation Keys

Translations MUST include `contactMessages.starred` ("Destacados" / "Starred") and `contactMessages.star` / `contactMessages.unstar` for both `es` and `en`.

#### Scenario: Starred translation exists

- GIVEN the translation object
- WHEN `t('contactMessages.starred')` is called
- THEN it returns "Destacados" in Spanish and "Starred" in English
