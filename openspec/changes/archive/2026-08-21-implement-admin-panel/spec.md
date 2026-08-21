# Spec: Implement Admin Panel

## API Specs

### Blog Post API (NEW - 5 endpoints)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/blog-posts` | Public | List all with filters (status, category, page, limit) |
| GET | `/api/blog-posts/:slug` | Public | Get by slug |
| GET | `/api/blog-posts/by-id/:id` | Protected | Get by ID for edit |
| POST | `/api/blog-posts` | Protected | Create new post |
| PUT | `/api/blog-posts/:id` | Protected | Update post |
| DELETE | `/api/blog-posts/:id` | Protected | Soft delete |
| PATCH | `/api/blog-posts/:id/restore` | Protected | Restore deleted |
| PATCH | `/api/blog-posts/:id/reorder` | Protected | Reorder |
| PATCH | `/api/blog-posts/:id/status` | Protected | Change status |

## Pages Specs

### Login Page (`/admin/login`)
- Fields: email, password
- JWT stored in localStorage on success
- Redirects to `/admin/dashboard` on auth
- Shows error on failure

### Dashboard Page (`/admin/dashboard`)
- Summary cards: counts for all entities
- Recent items list
- Uses TanStack Query for data fetching

### Services CRUD (3 pages)
- List: table with pagination, filter by category/featured, actions (edit/delete/toggle featured)
- Create: form with Zod validation, all schema fields
- Edit: pre-filled form, updates via PUT

### Products CRUD (3 pages)
- List: table with pagination, filter by category/price
- Create: form with price validation
- Edit: pre-filled form, updates via PUT

### Tools CRUD (3 pages)
- List: table with pagination, drag-to-reorder
- Create: form with optional link field
- Edit: pre-filled form, updates via PUT

### Success Cases CRUD (3 pages)
- List: table with pagination, filter by client
- Create: form with optional testimonial
- Edit: pre-filled form, updates via PUT

### Blog Posts CRUD (3 pages)
- List: table with status filter, status change action
- Create: form with TipTap editor (min 100 chars body)
- Edit: pre-filled form with TipTap content

### Contact Forms (1 page)
- List: read-only table, view full message
- NO edit/delete functionality

## Auth Specs

### Login Flow
1. User enters credentials at `/admin/login`
2. POST `/api/auth/login` with email/password
3. On success: store JWT in localStorage, redirect to dashboard
4. On failure: display error, no token stored

### Token Storage
- JWT MUST be stored in localStorage (not httpOnly cookies)
- Key: `admin_token`

### 401 Handling
- API client interceptor catches 401 responses
- Removes token from localStorage
- Redirects to `/admin/login`

### ProtectedRoute
- Wraps all `/admin/*` routes except `/admin/login`
- Checks for token existence
- Redirects to login if missing/invalid

## Layout Specs

### DashboardLayout
- Sidebar: navigation links, collapsible on mobile
- Header: user info, logout button
- Main content: rendered via React Router v7

### Navigation Links
- Dashboard
- Services
- Products
- Tools
- Success Cases
- Blog Posts
- Contact Forms

## Data Fetching Specs

### TanStack Query Hooks (per entity)
- `useGetAll`: list with pagination/filters
- `useGetById`: single item by ID
- `useCreate`: mutation for POST
- `useUpdate`: mutation for PUT
- `useDelete`: mutation for DELETE
- `useRestore`: mutation for PATCH restore
- `useReorder`: mutation for PATCH reorder

### Entities with hooks
- Services
- Products
- Tools
- SuccessCases
- BlogPosts
- ContactForms (read-only: useGetAll only)

## UI Components (from @jsoft/shared)

Reusable components:
1. Button
2. Input
3. Card
4. Modal
5. Loading
6. ErrorMessage
7. (Table - if available)

## Scenarios

### Scenario: Admin login success
- GIVEN user is on `/admin/login`
- WHEN user enters valid credentials and submits
- THEN JWT stored in localStorage, redirects to `/admin/dashboard`

### Scenario: Access protected route without auth
- GIVEN user has no token
- WHEN user navigates to `/admin/services`
- THEN system redirects to `/admin/login`

### Scenario: Create service with validation
- GIVEN user is on `/admin/services/new`
- WHEN user submits form with title < 3 chars
- THEN system shows validation error, no API call

### Scenario: Delete with confirmation
- GIVEN user is on services list
- WHEN user clicks delete button
- THEN confirmation modal appears, on confirm calls DELETE API

### Scenario: Blog post TipTap editor
- GIVEN user is creating blog post
- WHEN user types in TipTap editor
- THEN rich text content saved as HTML string in body field

### Scenario: 401 triggers logout
- GIVEN user is authenticated
- WHEN API returns 401 on any request
- THEN token removed, redirect to `/admin/login`

### Scenario: Blog post status filter
- GIVEN user is on blog posts list
- WHEN user selects "DRAFT" in status filter
- THEN table shows only draft posts

### Scenario: Reorder tools via drag
- GIVEN user is on tools list
- WHEN user drags tool to new position
- THEN PATCH `/api/tools/:id/reorder` called with new order

## Risks

1. **BlogPost API not implemented** (High) - Must implement 5+ new endpoints
2. **JWT expiration handling** (Medium) - Interceptor needed for 401 responses
3. **TipTap editor complexity** (Low) - Use starter-kit initially
4. **Large effort ~15-20 pages** (Medium) - Reuse patterns, shared components
5. **TanStack Query learning curve** (Low) - Team familiar with React Query v5
