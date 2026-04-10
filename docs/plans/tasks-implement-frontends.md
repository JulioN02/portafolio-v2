# Tasks: Implement Frontends

## Phase 1: Foundation (Shared Infrastructure)

- [ ] 1.1 Create API client service in `packages/shared/src/api-client/` with Axios instance, JWT interceptor, and error handling
- [ ] 1.2 Create base UI components in `packages/shared/src/components/`: Button, Input, Card, Modal, Loading, Error
- [ ] 1.3 Create ProtectedRoute component in `packages/shared/src/components/ProtectedRoute.tsx`
- [ ] 1.4 Create CSS variables file in `packages/shared/src/styles/variables.css` with design tokens
- [ ] 1.5 Export all shared components from `packages/shared/src/index.ts`
- [ ] 1.6 Verify shared package builds successfully with `pnpm build`

## Phase 2: Client Site Implementation

- [ ] 2.1 Initialize React app structure in `client-site/src/` with Vite + React Router 7
- [ ] 2.2 Create API client instance in `client-site/src/api/client.ts` importing from shared package
- [ ] 2.3 Create auth context and hook in `client-site/src/hooks/useAuth.ts`
- [ ] 2.4 Create React Query hooks for services in `client-site/src/hooks/useServices.ts`
- [ ] 2.5 Create Home page with hero section and featured services grid in `client-site/src/pages/Home/`
- [ ] 2.6 Create Services listing page with pagination in `client-site/src/pages/Services/`
- [ ] 2.7 Create Service detail page by slug in `client-site/src/pages/Services/[slug].tsx`
- [ ] 2.8 Create Contact page with form and Zod validation in `client-site/src/pages/Contact/`
- [ ] 2.9 Create layout components (Header, Footer, Layout) in `client-site/src/components/layout/`
- [ ] 2.10 Create global styles in `client-site/src/styles/globals.css` importing shared variables
- [ ] 2.11 Configure React Router with routes in `client-site/src/App.tsx`
- [ ] 2.12 Verify client-site builds and runs with `pnpm dev`

## Phase 3: Admin Panel Implementation

- [ ] 3.1 Initialize React app structure in `admin-panel/src/` with Vite + React Router 7
- [ ] 3.2 Create API client instance in `admin-panel/src/api/client.ts` importing from shared package
- [ ] 3.3 Create auth context with admin-specific logic in `admin-panel/src/hooks/useAuth.ts`
- [ ] 3.4 Create React Query hooks for services CRUD in `admin-panel/src/hooks/useServices.ts`
- [ ] 3.5 Create React Query hooks for contacts management in `admin-panel/src/hooks/useContacts.ts`
- [ ] 3.6 Create Login page with form and error handling in `admin-panel/src/pages/Login/`
- [ ] 3.7 Create Dashboard page with stats in `admin-panel/src/pages/Dashboard/`
- [ ] 3.8 Create Services list page with pagination and actions in `admin-panel/src/pages/Services/`
- [ ] 3.9 Create Service form (create/edit) with Zod validation in `admin-panel/src/pages/Services/Form.tsx`
- [ ] 3.10 Create Contacts list page with filtering in `admin-panel/src/pages/Contacts/`
- [ ] 3.11 Create Contact detail view in `admin-panel/src/pages/Contacts/[id].tsx`
- [ ] 3.12 Create admin layout with sidebar in `admin-panel/src/components/layout/AdminLayout.tsx`
- [ ] 3.13 Configure protected routes in `admin-panel/src/App.tsx`
- [ ] 3.14 Verify admin-panel builds and runs with `pnpm dev`

## Phase 4: Recruiter Site Implementation

- [ ] 4.1 Initialize React app structure in `recruiter-site/src/` with Vite + React Router 7
- [ ] 4.2 Create API client instance in `recruiter-site/src/api/client.ts` importing from shared package
- [ ] 4.3 Create React Query hooks for projects/services in `recruiter-site/src/hooks/useProjects.ts`
- [ ] 4.4 Create Home page with personal hero and tech stack in `recruiter-site/src/pages/Home/`
- [ ] 4.5 Create Projects listing page with filters in `recruiter-site/src/pages/Projects/`
- [ ] 4.6 Create Project detail page with technical info in `recruiter-site/src/pages/Projects/[id].tsx`
- [ ] 4.7 Create Contact page for recruiters in `recruiter-site/src/pages/Contact/`
- [ ] 4.8 Create layout components (Header, Footer, Layout) in `recruiter-site/src/components/layout/`
- [ ] 4.9 Configure React Router with routes in `recruiter-site/src/App.tsx`
- [ ] 4.10 Verify recruiter-site builds and runs with `pnpm dev`

## Phase 5: Testing and Integration

- [ ] 5.1 Write unit tests for API client interceptors in `packages/shared/src/api-client/__tests__/`
- [ ] 5.2 Write unit tests for ProtectedRoute component
- [ ] 5.3 Write integration tests for client-site home page loading featured services
- [ ] 5.4 Write integration tests for admin-panel login flow
- [ ] 5.5 Write integration tests for recruiter-site projects filtering
- [ ] 5.6 Verify all frontends can connect to running API (manual test)
- [ ] 5.7 Test responsive design on mobile viewport for all frontends
- [ ] 5.8 Test form validation with invalid data on all contact forms
- [ ] 5.9 Test authentication flow (login, token persistence, logout) in admin-panel
- [ ] 5.10 Test CRUD operations for services in admin-panel

## Phase 6: Cleanup and Documentation

- [ ] 6.1 Remove any console.log statements from production code
- [ ] 6.2 Add JSDoc comments to shared components and API client
- [ ] 6.3 Update package.json files with proper descriptions and scripts
- [ ] 6.4 Create README.md for each frontend with setup instructions
- [ ] 6.5 Verify TypeScript compilation with strict mode in all projects
- [ ] 6.6 Run linting and fix any issues in all frontends