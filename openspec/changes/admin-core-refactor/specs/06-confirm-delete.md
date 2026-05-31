# Spec: Confirm Delete — Shared confirmation modal for all entities

## Description

Create a reusable `ConfirmDelete` modal component and replace the two existing inconsistent delete confirmation patterns: the two-click confirmation (used in Tools, Services, Products, BlogPosts) and `window.confirm()` (used in SuccessCases). Standardize all entity deletions with a single, accessible, styled confirmation modal.

## Requirements

### 1. Shared Component: Create `ConfirmDelete` modal
- **Given** no shared confirmation modal exists in the admin panel
- **When** creating the ConfirmDelete component
- **Then** a new component is created (preferably in `admin-panel/src/components/common/ConfirmDelete.tsx` or in the shared package)
- **And** it has the following interface:
  - Props: `isOpen: boolean`, `title: string` (item title being deleted), `entityName: string` (e.g. "tool", "service"), `onConfirm: () => void`, `onCancel: () => void`, `isLoading?: boolean`
  - Renders as an overlay modal (semi-transparent backdrop + centered card)
  - Shows: warning icon, "Delete [entityName]?" heading, item title, "Are you sure?" message, Cancel and Delete buttons
  - Delete button is red/danger variant, Cancel is secondary
  - The modal is keyboard-accessible: Escape closes, Enter confirms
  - Closes on backdrop click
- **And** the component uses existing CSS variables for styling (or inline styles consistent with the admin panel)

### 2. Current Delete Patterns to Replace

**Pattern A — Two-click confirmation** (Services, Products, Tools, BlogPosts):
```
const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
const handleDelete = (id: string) => {
  if (deleteConfirm === id) {
    deleteMutation.mutate(id);
    setDeleteConfirm(null);
  } else {
    setDeleteConfirm(id);
  }
};
```
This pattern is confusing — the user sees no visual feedback on first click, then the delete happens on second click without warning.

**Pattern B — `window.confirm()`** (SuccessCases):
```
const handleDelete = async (id: string) => {
  if (window.confirm(t('common.confirmDelete'))) {
    await deleteMutation.mutateAsync(id);
  }
};
```
This pattern works but uses the browser's native confirm dialog which looks inconsistent with the admin panel design.

### 3. Replace delete pattern in Services List
- **Given** `admin-panel/src/pages/services/ServicesList.tsx` uses two-click pattern
- **When** replacing with ConfirmDelete modal
- **Then** `deleteConfirm` state is replaced with modal state: `const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)`
- **And** `handleDelete` opens the modal instead of using two-click logic
- **And** `onConfirm` calls `deleteMutation.mutate(deleteTarget.id)` and closes modal
- **And** `<ConfirmDelete>` modal is rendered conditionally
- **And** the entity title is passed to the modal for display

### 4. Replace delete pattern in Products List
- **Given** `admin-panel/src/pages/products/ProductsList.tsx` uses two-click pattern
- **When** replacing with ConfirmDelete modal
- **Then** Same transformation as Services (step 3)

### 5. Replace delete pattern in Tools List
- **Given** `admin-panel/src/pages/tools/ToolsList.tsx` uses two-click pattern
- **When** replacing with ConfirmDelete modal
- **Then** Same transformation as Services (step 3)

### 6. Replace delete pattern in BlogPosts List
- **Given** `admin-panel/src/pages/blog-posts/BlogPostsListPage.tsx` uses two-click pattern
- **When** replacing with ConfirmDelete modal
- **Then** Same transformation as Services (step 3)

### 7. Replace delete pattern in SuccessCases List
- **Given** `admin-panel/src/pages/success-cases/SuccessCasesList.tsx` uses `window.confirm()`
- **When** replacing with ConfirmDelete modal
- **Then** `handleDelete` opens the modal instead of calling `window.confirm()`
- **And** Same modal state pattern as other entities

### 8. Pass item title to the modal
- **Given** list components have access to the full item object (with `title`)
- **When** opening the delete modal
- **Then** the item's `title` is stored in the modal state
- **And** displayed in the modal so the user can see exactly what they're deleting

### 9. Delete confirmation from table/list components
- **Given** table/list components (ProductTable, ServiceTable, ToolList, SuccessCaseList, BlogPostList) receive `onDelete` callback
- **When** updating the delete pattern
- **Then** the `onDelete` callback is kept and called when user clicks the delete button
- **And** the modal state (deleteTarget) is managed at the page level, not in the table component
- **And** each table/list component still calls `onDelete(item.id)` on delete button click — no changes needed in the component itself

## Acceptance Criteria
- [ ] ConfirmDelete modal component exists and renders correctly
- [ ] All 5 entity list pages use the modal instead of two-click or window.confirm
- [ ] Modal shows item title and entity name
- [ ] Escape key and backdrop click close the modal
- [ ] Confirm triggers the delete mutation
- [ ] Cancel closes the modal without deleting
- [ ] After delete, modal closes and list refreshes
- [ ] TypeScript 0 errors

## Affected Files
- `admin-panel/src/components/common/ConfirmDelete.tsx` — new file
- `admin-panel/src/pages/services/ServicesList.tsx` — replace two-click with modal
- `admin-panel/src/pages/products/ProductsList.tsx` — replace two-click with modal
- `admin-panel/src/pages/tools/ToolsList.tsx` — replace two-click with modal
- `admin-panel/src/pages/blog-posts/BlogPostsListPage.tsx` — replace two-click with modal
- `admin-panel/src/pages/success-cases/SuccessCasesList.tsx` — replace window.confirm with modal
