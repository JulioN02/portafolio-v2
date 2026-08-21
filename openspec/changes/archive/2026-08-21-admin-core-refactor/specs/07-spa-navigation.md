# Spec: SPA Navigation — Fix full-page reloads on Tools and Blog edit links

## Description

Replace `window.location.href` navigation with proper React Router SPA navigation (`Link` component or `navigate()`) on Tools and BlogPosts list pages. Currently, Services, Products, and SuccessCases already use `<Link>` or `navigate()` for edit navigation, but Tools and BlogPosts use `window.location.href` which causes full page reloads.

## Requirements

### 1. Fix Tools List Edit Navigation
- **Given** `admin-panel/src/pages/tools/ToolsList.tsx` uses:
  ```tsx
  onEdit={(id) => window.location.href = `/tools/edit/${id}`}
  ```
- **When** fixing to SPA navigation
- **Then** the `onEdit` callback is changed to use `navigate()` from react-router-dom
- **And** the component imports `useNavigate` and calls `navigate(id)` inside the callback
- **And** the URL matches the existing pattern: `/tools/edit/${id}`

### 2. Fix BlogPosts List Edit Navigation
- **Given** `admin-panel/src/pages/blog-posts/BlogPostsListPage.tsx` uses:
  ```tsx
  onEdit={(id) => (window.location.href = `/blog-posts/edit/${id}`)}
  ```
- **When** fixing to SPA navigation
- **Then** the `onEdit` callback is changed to use `navigate()` from react-router-dom
- **And** the component imports `useNavigate` and calls `navigate(id)` inside the callback
- **And** the URL matches the existing pattern: `/blog-posts/edit/${id}`

### 3. Verify reference patterns already correct
- **Given** `ProductTable.tsx` already uses `<Link to={/products/edit/${product.id}}>` for edit navigation
- **And** `ServiceTable.tsx` already uses `<Link to={/services/edit/${service.id}}>` for edit navigation
- **And** `SuccessCasesList.tsx` already uses `navigate(/success-cases/edit/${id})` in `handleEdit`
- **When** making changes
- **Then** these correct patterns are intentionally NOT modified (they serve as reference implementation)

### 4. Ensure `useNavigate` is properly imported
- **Given** `ToolsList.tsx` currently imports from `react-router-dom` (specifically `Link`) but does not import `useNavigate`
- **When** fixing
- **Then** `useNavigate` is added to the import from `react-router-dom`
- **And** BlogPostsListPage already imports `useState` from react but needs `useNavigate` added

### 5. Behavior expectations after fix
- **Given** the edit links currently cause full page reload (losing React state, refetching all data)
- **When** using SPA navigation
- **Then** clicking Edit navigates without full page reload
- **And** the edit page components (`ToolEditPage`, `BlogPostEditPage`) render correctly in the SPA context
- **And** browser history is properly updated (back button works to return to list)

## Acceptance Criteria
- [ ] Tools list "Edit" button uses SPA navigation (no full reload)
- [ ] BlogPosts list "Edit" button uses SPA navigation (no full reload)
- [ ] `window.location.href` no longer used for edit navigation in these 2 pages
- [ ] Services, Products, SuccessCases already correct — no changes needed
- [ ] TypeScript 0 errors
- [ ] Edit pages navigate correctly and render

## Affected Files
- `admin-panel/src/pages/tools/ToolsList.tsx` — replace `window.location.href` with `navigate()`, add `useNavigate` import
- `admin-panel/src/pages/blog-posts/BlogPostsListPage.tsx` — replace `window.location.href` with `navigate()`, add `useNavigate` import
