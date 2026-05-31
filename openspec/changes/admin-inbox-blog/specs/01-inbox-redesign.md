# Delta: Admin Inbox Redesign

## Domain

Contact forms admin inbox — read tracking, archiving, labels, search, filters, and Gmail-like UI.

## MODIFIED Requirements

### Requirement: List Contact Forms

The system SHALL provide an inbox page at `/admin/contact-messages` with a Gmail-like two-panel layout (list on left, preview on right on desktop; stacked on mobile). The list SHALL display messages with read/unread visual states, sender name, email, subject (source), date, archive status, and labels. The system MUST support pagination via the API (page/limit params passed to `useGetAll`). The system MUST support search (ILIKE on firstName, lastName, email, message) and filtering by isRead, isArchived, and label. The preview panel SHALL show the full message detail, a "Mark as Read" button when unread, an "Archive/Unarchive" button, and label management. The system SHALL display stats cards (total, unread count) at the top.
(Previously: Basic table list with date range filter, no search/archive/labels)

#### Scenario: Inbox loads with two-panel layout

- GIVEN user is authenticated and navigates to `/admin/contact-messages`
- WHEN the page loads
- THEN the left panel shows a scrollable message list with unread indicators (blue background + bold) and the right panel shows a placeholder or first message detail
- AND pagination is driven by API page/limit params

#### Scenario: Search filters messages

- GIVEN user is on the inbox page
- WHEN user types in the search bar (300ms debounce)
- THEN the list filters to messages whose firstName, lastName, email, or message match the search term (case-insensitive ILIKE)

#### Scenario: Filter by read/unread status

- GIVEN user is on the inbox page
- WHEN user selects "Unread" filter
- THEN only messages where `readAt` is null are shown
- WHEN user selects "Read" filter
- THEN only messages where `readAt` is not null are shown

#### Scenario: Filter by archive status and labels

- GIVEN user is on the inbox page
- WHEN user toggles "Show archived" filter
- THEN messages with `archived: true` are included
- WHEN user selects a label filter
- THEN only messages containing that label are shown

#### Scenario: Mark message as read

- GIVEN user views an unread message in the preview panel
- WHEN user clicks "Mark as Read"
- THEN the system calls `PATCH /api/contact/:id/read`
- AND `readAt` is set to current timestamp
- AND the message visually updates to read state (white background, normal weight)

#### Scenario: Archive/Unarchive a message

- GIVEN user views a message in the preview panel
- WHEN user clicks "Archive"
- THEN the system calls `PATCH /api/contact/:id/archive`
- AND `archived` is toggled to `true`
- AND the message moves to archived state
- WHEN user clicks "Unarchive"
- THEN `archived` toggles to `false`

#### Scenario: Manage labels on a message

- GIVEN user views a message in the preview panel
- WHEN user opens label management
- THEN the system calls `POST /api/contact/:id/labels`
- AND labels are persisted as an array of strings
- AND labels display as colored badges on the message

#### Scenario: Mobile layout stacks panels

- GIVEN viewport is below 768px
- WHEN user opens a message from the list
- THEN the list panel is replaced or overlaid by the detail panel
- AND a back button returns to the list

#### Scenario: Pagination passes page/limit correctly

- GIVEN the inbox page loads with page=2 and limit=20
- WHEN `useGetAll` is called
- THEN the API receives `?page=2&limit=20`
- AND only the correct page of results is returned

## ADDED Requirements

### Requirement: ContactForm Model Schema Extension

The ContactForm model MUST gain three new fields: `readAt DateTime?`, `archived Boolean @default(false)`, and `labels String[] @default([])`.

#### Scenario: Migration adds fields

- GIVEN the Prisma schema is migrated
- WHEN the database is inspected
- THEN ContactForm table has columns readAt (nullable timestamp), archived (boolean, default false), labels (text array, default empty)

### Requirement: Shared Schema Extension

`ContactFormResponse` interface MUST include `readAt`, `archived`, and `labels`. A new `contactFormFilterSchema` MUST be exported with optional fields: `search` (string), `isRead` (boolean), `isArchived` (boolean), `label` (string).

#### Scenario: Shared types include new fields

- GIVEN a contact form from the API
- WHEN it is parsed as `ContactFormResponse`
- THEN `readAt`, `archived`, and `labels` are present

### Requirement: API Endpoints for Inbox Actions

The API MUST expose three new protected endpoints: `PATCH /api/contact/:id/read` (sets readAt), `PATCH /api/contact/:id/archive` (toggles archived), `POST /api/contact/:id/labels` (sets labels array).

#### Scenario: PATCH /:id/read returns updated contact

- GIVEN contact with id exists
- WHEN a PATCH request is sent to `/api/contact/:id/read`
- THEN response returns the contact with `readAt` set to current time

#### Scenario: PATCH /:id/archive toggles archived

- GIVEN contact with id exists and `archived` is false
- WHEN a PATCH request is sent to `/api/contact/:id/archive`
- THEN response returns contact with `archived: true`
- WHEN sent again
- THEN response returns contact with `archived: false`

#### Scenario: POST /:id/labels sets labels

- GIVEN contact with id exists
- WHEN a POST request is sent with body `{ labels: ["urgent", "client"] }`
- THEN response returns contact with `labels: ["urgent", "client"]`

### Requirement: API GET Search and Filter Params

`GET /api/contact` MUST support query params: `search` (ILIKE across firstName, lastName, email, message), `isRead` (filters by readAt null/not null), `isArchived` (filters by archived boolean), `label` (filters by labels array contains).

#### Scenario: Search by email fragment

- GIVEN contacts exist with various emails
- WHEN `GET /api/contact?search=gmail` is called
- THEN only contacts whose email contains "gmail" (case-insensitive) are returned

#### Scenario: Filter by isRead

- GIVEN some contacts have readAt set and others do not
- WHEN `GET /api/contact?isRead=true` is called
- THEN only contacts with readAt not null are returned

#### Scenario: Combined search + filter

- GIVEN contacts with various attributes
- WHEN `GET /api/contact?search=john&isArchived=false&label=urgent` is called
- THEN results match ALL conditions (AND logic)
