# Spec: Back Button — Shared component for all Edit/Create pages

## Description

Create a reusable `BackButton` component and add it to all entity Edit and Create pages in the admin panel. Currently, only `SuccessCaseEdit` and `SuccessCaseCreate` have back buttons (inline styled `<button>`). The other pages (`ServiceEdit`, `ServiceCreate`, `ProductEdit`, `ProductCreate`, `ToolEdit`, `ToolCreate`, `BlogPostEdit`, `BlogPostCreate`) lack back navigation entirely.

## Requirements

### 1. Shared Component: Create `BackButton` in shared package
- **Given** `packages/shared/src/components/` contains shared UI components (Button, Input, etc.)
- **When** creating the BackButton component
- **Then** a new component is created at `packages/shared/src/components/ui/BackButton/BackButton.tsx`
- **And** it has the following interface:
  - Props: `to: string` (the route to navigate back to), optional `label?: string` (defaults to translated "Back"), optional `className?: string`
  - Uses `useNavigate()` internally from react-router-dom (or receives `onClick` handler)
  - Renders as `<button>` with `←` prefix arrow and label text
  - Styled using existing CSS variables: neutral background, white text, rounded corners, consistent with the existing SuccessCase pattern
- **And** it is exported from `packages/shared/src/components/index.ts`

**Design Note**: Since `BackButton` uses `useNavigate()` from react-router-dom, it must be used within a `RouterProvider` context. This is acceptable as the admin panel is a client-rendered SPA using React Router.

**Alternative**: If cross-package dependency on react-router-dom is a concern, the component can be created locally in `admin-panel/src/components/common/BackButton.tsx` instead. Decision during design phase.

### 2. Back Button on Edit Pages
- **Given** the following edit pages lack a back button:
  - `admin-panel/src/pages/services/ServiceEdit.tsx`
  - `admin-panel/src/pages/products/ProductEdit.tsx`
  - `admin-panel/src/pages/tools/ToolEdit.tsx`
  - `admin-panel/src/pages/blog-posts/BlogPostEditPage.tsx`
- **Given** `SuccessCaseEdit.tsx` already has an inline back button
- **When** adding BackButton to all edit pages
- **Then** each page renders `<BackButton to="/entity-route" />` above the page title
- **And** the existing inline back button in `SuccessCaseEdit.tsx` is replaced with the shared `BackButton` component
- **And** the back button navigates to the entity's list page (e.g., `/services`, `/products`, `/tools`, `/blog-posts`, `/success-cases`)

### 3. Back Button on Create Pages
- **Given** the following create pages lack a back button:
  - `admin-panel/src/pages/services/ServiceCreate.tsx`
  - `admin-panel/src/pages/products/ProductCreate.tsx`
  - `admin-panel/src/pages/tools/ToolCreate.tsx`
  - `admin-panel/src/pages/blog-posts/BlogPostCreatePage.tsx` (verify path)
- **Given** `SuccessCaseCreate.tsx` already has an inline back button
- **When** adding BackButton to all create pages
- **Then** each page renders `<BackButton to="/entity-route" />` above the page title
- **And** the existing inline back button in `SuccessCaseCreate.tsx` is replaced with the shared `BackButton` component

### 4. Placement and Styling Consistency
- **Given** different pages have different layout containers (some use `<div>`, some use `style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}`)
- **When** adding BackButton
- **Then** BackButton placement is consistent: renders right inside the page container, before the `<h1>` title
- **And** the BackButton inherits neutral gray styling (`#6b7280` or `var(--color-neutral-500)`) matching the existing pattern
- **And** no layout refactoring is needed — BackButton just renders as an inline block element

### 5. Error State Back Buttons
- **Given** some edit pages have error states with inline back buttons (e.g., `SuccessCaseEdit.tsx` lines 39-51)
- **When** adding BackButton
- **Then** error state back buttons should also use the shared component pattern (or remain inline for simplicity — decide during design)

## Acceptance Criteria
- [ ] BackButton component exists and renders correctly
- [ ] All 8 edit/create pages have a back button
- [ ] Existing SuccessCase back buttons are replaced with the shared component
- [ ] Back navigation navigates to correct list page
- [ ] Styling is consistent across all pages
- [ ] TypeScript 0 errors

## Affected Files
- `packages/shared/src/components/ui/BackButton/BackButton.tsx` — new (or `admin-panel/src/components/common/BackButton.tsx`)
- `packages/shared/src/components/index.ts` — add export
- `admin-panel/src/pages/services/ServiceEdit.tsx` — add BackButton
- `admin-panel/src/pages/services/ServiceCreate.tsx` — add BackButton
- `admin-panel/src/pages/products/ProductEdit.tsx` — add BackButton
- `admin-panel/src/pages/products/ProductCreate.tsx` — add BackButton
- `admin-panel/src/pages/tools/ToolEdit.tsx` — add BackButton
- `admin-panel/src/pages/tools/ToolCreate.tsx` — add BackButton
- `admin-panel/src/pages/blog-posts/BlogPostEditPage.tsx` — add BackButton
- `admin-panel/src/pages/blog-posts/BlogPostCreatePage.tsx` — add BackButton (verify file exists)
- `admin-panel/src/pages/success-cases/SuccessCaseEdit.tsx` — replace inline button with BackButton
- `admin-panel/src/pages/success-cases/SuccessCaseCreate.tsx` — replace inline button with BackButton
