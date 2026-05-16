# Tasks: Implement Admin Panel

## Phase 1: Infrastructure & Setup

- [ ] 1.1 Install dependencies: @tiptap/react, @tiptap/starter-kit, @tanstack/react-query, react-router-dom, zod, slugify
- [ ] 1.2 Create folder structure: src/{api,hooks,components,pages,routes,types,utils}/
- [ ] 1.3 Create src/types/index.ts with AuthState, DashboardSummary, NavItem interfaces
- [ ] 1.4 Create src/utils/slugify.ts utility function
- [ ] 1.5 Create src/utils/getTextFromHTML.ts helper for TipTap validation
- [ ] 1.6 Setup TanStack Query Client in src/main.tsx with retry:1, refetchOnWindowFocus:false, staleTime:5min

## Phase 2: API Client & Auth Foundation

- [ ] 2.1 Create src/api/client.ts with base URL from VITE_API_URL, interceptors for JWT from localStorage
- [ ] 2.2 Create src/api/auth.ts with login() POST /api/auth/login, store JWT as 'admin_token'
- [ ] 2.3 Create src/hooks/useAuth.ts with login/logout/isAuthenticated checks, JWT decode
- [ ] 2.4 Create src/components/auth/ProtectedRoute.tsx using @jsoft/shared ProtectedRoute pattern
- [ ] 2.5 Create src/components/auth/LoginForm.tsx with email/password, useAuth, @jsoft/shared Input/Button/ErrorMessage

## Phase 3: Layout Components

- [ ] 3.1 Create src/components/layout/Sidebar.tsx with NavItem array, collapse state, active route highlight
- [ ] 3.2 Create src/components/layout/Header.tsx with user info display and logout button
- [ ] 3.3 Create src/components/layout/DashboardLayout.tsx wrapper with Sidebar + Header + children

## Phase 4: API BlogPost (New Backend Endpoints)

- [ ] 4.1 Create backend routes for BlogPost: GET /api/blog-posts, GET /api/blog-posts/:slug, GET /api/blog-posts/id/:id
- [ ] 4.2 Create backend routes for BlogPost: POST /api/blog-posts, PUT /api/blog-posts/:id, DELETE /api/blog-posts/:id
- [ ] 4.3 Create backend routes for BlogPost: PATCH /api/blog-posts/:id/restore, PATCH /api/blog-posts/:id/reorder, PATCH /api/blog-posts/:id/status
- [ ] 4.4 Create src/api/blogPosts.api.ts with 7 functions: getAll, getBySlug, getById, create, update, delete, updateStatus

## Phase 5: TanStack Query Hooks

- [ ] 5.1 Create src/hooks/useServices.ts with useGetAll, useGetById, useCreate, useUpdate, useDelete, useToggleFeatured
- [ ] 5.2 Create src/hooks/useProducts.ts with useGetAll, useGetById, useCreate, useUpdate, useDelete
- [ ] 5.3 Create src/hooks/useTools.ts with useGetAll, useGetById, useCreate, useUpdate, useDelete, useReorder
- [ ] 5.4 Create src/hooks/useSuccessCases.ts with useGetAll, useGetById, useCreate, useUpdate, useDelete
- [ ] 5.5 Create src/hooks/useBlogPosts.ts with useGetAll, useGetById, useCreate, useUpdate, useDelete, useUpdateStatus
- [ ] 5.6 Create src/hooks/useContactForms.ts with useGetAll only (read-only)

## Phase 6: Dashboard Page

- [ ] 6.1 Create src/pages/Dashboard.tsx with SummaryCards using useServices/useProducts/useTools/useBlogPosts/useContactForms
- [ ] 6.2 Create src/components/dashboard/SummaryCard.tsx using @jsoft/shared Card component

## Phase 7: Services CRUD

- [ ] 7.1 Create src/pages/services/ServicesList.tsx with pagination, filter, delete modal, useServices
- [ ] 7.2 Create src/pages/services/ServiceCreate.tsx with Zod validation using service.schema, useCreate
- [ ] 7.3 Create src/pages/services/ServiceEdit.tsx with pre-filled form from useGetById, useUpdate
- [ ] 7.4 Create src/components/services/ServiceTable.tsx using @jsoft/shared Table/Pagination
- [ ] 7.5 Create src/components/services/ServiceForm.tsx with @jsoft/shared Input/Button/ErrorMessage

## Phase 8: Products CRUD

- [ ] 8.1 Create src/pages/products/ProductsList.tsx with price filter, delete confirmation, useProducts
- [ ] 8.2 Create src/pages/products/ProductCreate.tsx with price validation, useCreate
- [ ] 8.3 Create src/pages/products/ProductEdit.tsx with pre-filled form, useUpdate
- [ ] 8.4 Create src/components/products/ProductTable.tsx using @jsoft/shared Table/Pagination
- [ ] 8.5 Create src/components/products/ProductForm.tsx with price field validation

## Phase 9: Tools CRUD (with Drag-to-Reorder)

- [ ] 9.1 Create src/pages/tools/ToolsList.tsx with HTML5 drag-and-drop, useTools, useReorder mutation
- [ ] 9.2 Create src/pages/tools/ToolCreate.tsx with optional link field, useCreate
- [ ] 9.3 Create src/pages/tools/ToolEdit.tsx with pre-filled form, useUpdate
- [ ] 9.4 Create src/components/tools/ToolList.tsx with drag handlers, visual feedback during drag
- [ ] 9.5 Create src/components/tools/ToolForm.tsx with link validation (URL optional)

## Phase 10: SuccessCases CRUD

- [ ] 10.1 Create src/pages/success-cases/SuccessCasesList.tsx with client filter, useSuccessCases
- [ ] 10.2 Create src/pages/success-cases/SuccessCaseCreate.tsx with testimonial field, useCreate
- [ ] 10.3 Create src/pages/success-cases/SuccessCaseEdit.tsx with pre-filled form, useUpdate
- [ ] 10.4 Create src/components/success-cases/SuccessCaseTable.tsx with client column
- [ ] 10.5 Create src/components/success-cases/SuccessCaseForm.tsx with testimonial textarea

## Phase 11: BlogPosts CRUD (with TipTap Editor)

- [ ] 11.1 Create src/components/blog-posts/TipTapEditor.tsx with StarterKit extensions, onUpdate handler
- [ ] 11.2 Create src/pages/blog-posts/BlogPostsList.tsx with status filter (DRAFT/PUBLISHED), useBlogPosts
- [ ] 11.3 Create src/pages/blog-posts/BlogPostCreate.tsx with TipTapEditor, slug auto-generation, content validation min 100 chars
- [ ] 11.4 Create src/pages/blog-posts/BlogPostEdit.tsx with pre-filled TipTap content, useUpdate
- [ ] 11.5 Create src/components/blog-posts/BlogPostTable.tsx with status badge, filter controls
- [ ] 11.6 Create src/components/blog-posts/BlogPostForm.tsx with Title/Slug/Status/TipTapEditor fields

## Phase 12: ContactForms (Read-Only)

- [ ] 12.1 Create src/pages/contact-forms/ContactFormsList.tsx with date filter, pagination, useContactForms
- [ ] 12.2 Create src/components/contact-forms/ContactFormTable.tsx with expandable rows or modal for details
- [ ] 12.3 Create src/components/contact-forms/ContactFormDetail.tsx or modal view for full message

## Phase 13: Routing & Integration

- [ ] 13.1 Create src/routes/index.tsx with React Router v7 nested routes: /login, / (DashboardLayout wrapper)
- [ ] 13.2 Configure all routes: dashboard, services/*, products/*, tools/*, success-cases/*, blog-posts/*, contact-forms
- [ ] 13.3 Update src/App.tsx with QueryClientProvider, RouterProvider, wrap with DashboardLayout where needed
- [ ] 13.4 Update src/main.tsx to render App with StrictMode

## Phase 14: Testing & Polish

- [ ] 14.1 Manual testing: Auth flow (login → token → redirect → 401 logout)
- [ ] 14.2 Manual testing: Services CRUD (create → list → edit → delete with modal confirmation)
- [ ] 14.3 Manual testing: BlogPost with TipTap (content validation <100 chars, slug generation)
- [ ] 14.4 Manual testing: Tools drag-to-reorder → PATCH /api/tools/:id/reorder
- [ ] 14.5 Manual testing: BlogPost status filter → only show DRAFT/PUBLISHED
- [ ] 14.6 UI polish: Responsive Sidebar (<768px collapse), loading states, error boundaries
- [ ] 14.7 Verify all protected routes redirect to /login when no token
- [ ] 14.8 Verify API client interceptor removes token and redirects on 401
