# Design: Implement Admin Panel

## Overview
Technical design for a complete admin panel implementation in PortafolioV2JSS. Covers authentication with JWT, CRUD operations for 5 entities (Services, Products, Tools, SuccessCases, BlogPosts), ContactForms read-only list, and a dashboard with summary cards. Uses React 19, TanStack Query v5, React Router v7, and TipTap editor.

## Technical Approach
Based on specifications from the SPEC phase, this design follows the existing patterns established in client-site:
- **CSS Modules** for styling (consistent with client-site)
- **TanStack Query v5** for data fetching with 7 hooks per entity
- **React Router v7** with nested routes and DashboardLayout
- **JWT Authentication** stored in localStorage (key: 'admin_token')
- **Zod schemas** from @jsoft/shared for validation
- **TipTap** with starter-kit for BlogPost rich text editing
- **@jsoft/shared** components: Button, Input, Card, Modal, Loading, ErrorMessage, ProtectedRoute

## Architecture Decisions

### Decision 1: JWT Storage in localStorage
**Choice**: localStorage with key 'admin_token'
**Alternatives**: HTTP-only cookies, sessionStorage
**Rationale**: Specs explicitly require localStorage; simpler implementation for SPA; matches existing pattern from spec. HTTP-only cookies would require server-side changes beyond scope.

### Decision 2: API Client with 401 Interceptor
**Choice**: Extend @jsoft/shared's createApiClient with custom onUnauthorized callback
**Alternatives**: Axios interceptors, manual fetch wrapper
**Rationale**: Reuses existing API client from @jsoft/shared; consistent with client-site pattern; native fetch has no external dependencies.

### Decision 3: TanStack Query for Data Fetching
**Choice**: 7 hooks per entity (useGetAll, useGetById, useCreate, useUpdate, useDelete, useRestore, useReorder)
**Alternatives**: useState/useEffect, SWR, RTK Query
**Rationale**: Specs require TanStack Query v5; excellent caching/invalidation; matches client-site patterns; built-in loading/error states.

### Decision 4: React Router v7 Nested Routes
**Choice**: DashboardLayout as parent route with nested children
**Alternatives**: Separate layouts, wrapper HOCs
**Rationale**: Clean code organization; automatic layout persistence; React Router v7 supports nested routes natively.

### Decision 5: TipTap for BlogPost Editor
**Choice**: @tiptap/react with starter-kit
**Alternatives**: Draft.js, Slate, plain textarea
**Rationale**: Specs require TipTap; starter-kit provides essentials (bold, italic, heading, list); extensible architecture.

### Decision 6: CSS Modules over CSS-in-JS
**Choice**: CSS Modules (consistent with client-site)
**Alternatives**: Tailwind CSS, styled-components, emotion
**Rationale**: Client-site uses CSS Modules; no new dependencies; simple scoping with .module.css files.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Admin Panel (React 19)                  │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │        React Router v7 (Nested Routes)        │  │  │
│  │  │  ┌─────────────────────────────────────────┐  │  │  │
│  │  │  │       DashboardLayout                   │  │  │  │
│  │  │  │  ┌──────────┐  ┌────────────────────┐  │  │  │  │
│  │  │  │  │ Sidebar  │  │   Page Content    │  │  │  │  │
│  │  │  │  │          │  │  (TanStack Query)  │  │  │  │  │
│  │  │  │  └──────────┘  └────────────────────┘  │  │  │  │
│  │  │  └─────────────────────────────────────────┘  │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/JSON
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                       │
│  /api/auth/login    → JWT token                            │
│  /api/services/*    → CRUD + restore/reorder/status        │
│  /api/products/*    → CRUD                                │
│  /api/tools/*       → CRUD + reorder                       │
│  /api/success-cases/* → CRUD                              │
│  /api/blog-posts/*  → CRUD + restore/reorder/status        │
│  /api/contact       → GET (read-only)                      │
└─────────────────────────────────────────────────────────────┘

Data Flow:
User Action → Component → TanStack Hook → API Client → API Route
                ↓                                    ↓
            Loading/Error                         Database
                ↓                                    ↓
            Re-render ← Invalidate Query ← Response
```

## Folder Structure

```
admin-panel/src/
├── api/
│   ├── client.ts                    # Extended API client with 401 interceptor
│   ├── auth.ts                      # Login, logout, getToken utilities
│   ├── services.api.ts              # Services CRUD API functions
│   ├── products.api.ts              # Products CRUD API functions
│   ├── tools.api.ts                 # Tools CRUD API functions
│   ├── successCases.api.ts          # SuccessCases CRUD API functions
│   ├── blogPosts.api.ts             # BlogPosts CRUD API functions
│   └── contactForms.api.ts          # ContactForms API functions
│
├── hooks/
│   ├── useAuth.ts                   # Auth state, login, logout
│   ├── useServices.ts               # 7 hooks: useGetAll, useGetById, useCreate, useUpdate, useDelete, useRestore, useReorder
│   ├── useProducts.ts               # 7 hooks similar pattern
│   ├── useTools.ts                  # 7 hooks + drag reorder logic
│   ├── useSuccessCases.ts           # 7 hooks similar pattern
│   ├── useBlogPosts.ts              # 7 hooks + TipTap content handling
│   └── useContactForms.ts           # useGetAll only (read-only)
│
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx      # Sidebar + Header wrapper
│   │   ├── DashboardLayout.module.css
│   │   ├── Sidebar.tsx              # Navigation links with highlighting
│   │   ├── Sidebar.module.css
│   │   ├── Header.tsx               # User info + logout button
│   │   └── Header.module.css
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx            # Email/password form
│   │   ├── LoginForm.module.css
│   │   └── ProtectedRoute.tsx       # Re-export from @jsoft/shared
│   │
│   ├── dashboard/
│   │   ├── Dashboard.tsx            # Summary cards + recent items
│   │   ├── Dashboard.module.css
│   │   ├── SummaryCard.tsx          # Individual stat card
│   │   └── SummaryCard.module.css
│   │
│   ├── services/
│   │   ├── ServicesList.tsx         # Paginated list with filters
│   │   ├── ServicesList.module.css
│   │   ├── ServiceForm.tsx          # Create/Edit form with Zod validation
│   │   ├── ServiceForm.module.css
│   │   └── DeleteConfirmModal.tsx   # Confirmation dialog
│   │
│   ├── products/
│   │   ├── ProductsList.tsx         # List with price filter
│   │   ├── ProductsList.module.css
│   │   ├── ProductForm.tsx          # Create/Edit with price validation
│   │   └── ProductForm.module.css
│   │
│   ├── tools/
│   │   ├── ToolsList.tsx            # List with drag-to-reorder
│   │   ├── ToolsList.module.css
│   │   ├── ToolForm.tsx             # Create/Edit with optional link
│   │   └── ToolForm.module.css
│   │
│   ├── success-cases/
│   │   ├── SuccessCasesList.tsx     # List with client filter
│   │   ├── SuccessCasesList.module.css
│   │   ├── SuccessCaseForm.tsx      # Create/Edit with testimonial
│   │   └── SuccessCaseForm.module.css
│   │
│   ├── blog-posts/
│   │   ├── BlogPostsList.tsx        # List with status filter
│   │   ├── BlogPostsList.module.css
│   │   ├── BlogPostForm.tsx         # Create/Edit with TipTap editor
│   │   ├── BlogPostForm.module.css
│   │   └── TipTapEditor.tsx         # TipTap wrapper component
│   │
│   └── contact-forms/
│       ├── ContactFormsList.tsx     # Read-only list with pagination
│       ├── ContactFormsList.module.css
│       └── ContactDetailModal.tsx   # Expand/modal view
│
├── pages/
│   ├── Login.tsx                    # /login route
│   ├── Login.module.css
│   ├── Dashboard.tsx                # /dashboard route
│   ├── ServicesPage.tsx             # /services route (list)
│   ├── ServiceCreate.tsx            # /services/create
│   ├── ServiceEdit.tsx              # /services/edit/:id
│   ├── ProductsPage.tsx             # /products route
│   ├── ProductCreate.tsx            # /products/create
│   ├── ProductEdit.tsx              # /products/edit/:id
│   ├── ToolsPage.tsx                # /tools route
│   ├── ToolCreate.tsx               # /tools/create
│   ├── ToolEdit.tsx                 # /tools/edit/:id
│   ├── SuccessCasesPage.tsx         # /success-cases route
│   ├── SuccessCaseCreate.tsx        # /success-cases/create
│   ├── SuccessCaseEdit.tsx          # /success-cases/edit/:id
│   ├── BlogPostsPage.tsx            # /blog-posts route
│   ├── BlogPostCreate.tsx           # /blog-posts/create
│   ├── BlogPostEdit.tsx             # /blog-posts/edit/:id
│   └── ContactFormsPage.tsx         # /contact-forms route
│
├── routes/
│   └── index.tsx                    # React Router v7 route definitions
│
├── types/
│   └── index.ts                     # Extended types for admin panel
│
├── utils/
│   ├── constants.ts                 # Route paths, localStorage keys
│   ├── dragHelpers.ts               # HTML5 drag-and-drop utilities for tools reorder
│   └── slugify.ts                   # Auto-generate slug from title
│
├── App.tsx                          # Router setup with QueryClientProvider
├── main.tsx                         # Entry point
└── index.css                        # Global styles + CSS variables
```

## Component Design

### 1. DashboardLayout
**Purpose**: Wraps all admin pages with sidebar navigation and header
**Props**: `{ children: React.ReactNode }`
**State**: `sidebarOpen: boolean` (for mobile <768px)
**Uses**: Sidebar, Header, @jsoft/shared Card (for content wrapper)

### 2. Sidebar
**Purpose**: Navigation menu with links to all CRUD pages
**Props**: `{ isOpen: boolean, onClose: () => void }`
**State**: None (stateless)
**Uses**: React Router `NavLink` for highlighting active route

### 3. Header
**Purpose**: Shows user email and logout button
**Props**: None (reads from auth hook)
**State**: None
**Uses**: useAuth hook, Button from @jsoft/shared

### 4. LoginForm
**Purpose**: Email/password form with JWT storage on success
**Props**: None (handles own submission)
**State**: `{ email: string, password: string, error: string | null, isLoading: boolean }`
**Uses**: useAuth hook, Input, Button, ErrorMessage from @jsoft/shared, login.schema from @jsoft/shared

### 5. ServicesList
**Purpose**: Paginated list with filter, delete with modal
**Props**: None (uses TanStack Query)
**State**: `{ page: number, filter: ServiceFilterInput, deleteModalOpen: boolean, selectedId: string | null }`
**Uses**: useServices hooks, Table UI, Pagination, Modal, Button, Loading from @jsoft/shared

### 6. ServiceForm
**Purpose**: Create/Edit service with Zod validation
**Props**: `{ serviceId?: string }` (undefined = create, string = edit)
**State**: `{ formData: ServiceInput, errors: Record<string, string[]> }`
**Uses**: useServices hooks (useCreate/useUpdate/useGetById), Input, Button, ErrorMessage from @jsoft/shared, service.schema from @jsoft/shared

### 7. ToolsList
**Purpose**: List with drag-to-reorder functionality
**Props**: None
**State**: `{ tools: ToolResponse[], dragId: string | null }`
**Uses**: useTools hooks, HTML5 drag-and-drop events, Button, Loading from @jsoft/shared

### 8. BlogPostForm
**Purpose**: Create/Edit with TipTap rich text editor
**Props**: `{ blogPostId?: string }`
**State**: `{ formData: BlogPostInput, content: string, errors: Record<string, string[]> }`
**Uses**: useBlogPosts hooks, TipTapEditor component, Input, Button, ErrorMessage from @jsoft/shared, blogPost.schema from @jsoft/shared

### 9. TipTapEditor
**Purpose**: Wrapper around @tiptap/react with starter-kit
**Props**: `{ content: string, onChange: (html: string) => void }`
**State**: Tiptap editor instance
**Uses**: @tiptap/react, @tiptap/starter-kit

### 10. Dashboard
**Purpose**: Summary cards + recent items
**Props**: None
**State**: None (uses TanStack Query hooks)
**Uses**: useServices, useProducts, useTools, useBlogPosts, useContactForms hooks, SummaryCard component, Card from @jsoft/shared

## API Client Setup

### Base Configuration (`api/client.ts`)
```typescript
import { createApiClient, type ApiClientConfig } from '@jsoft/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = createApiClient({
  baseUrl: API_BASE_URL,
  getToken: () => localStorage.getItem('admin_token'),
  onUnauthorized: () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  },
});
```

### TanStack Query Configuration (`App.tsx`)
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
```

### Interceptors
- **401 Handler**: Removes 'admin_token' from localStorage, redirects to /login
- **Headers**: Automatically attaches `Authorization: Bearer <token>` if token exists
- **Error Format**: Uses ApiClientError from @jsoft/shared with message, status, code, details

## Auth Flow

```
┌─────────────┐
│ User visits │
│  /admin/*   │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ ProtectedRoute   │
│ checks:          │
│ - Is there a     │
│   token in       │
│   localStorage?  │
└──────┬───────────┘
       │
       ├─── No token ───▶ Redirect to /login
       │
       ▼ Yes token
┌──────────────────┐
│ Render child     │
│ route (Dashboard │
│ or other page)   │
└──────────────────┘

┌─────────────┐
│ User at     │
│ /login      │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ LoginForm       │
│ - User enters   │
│   email/pass    │
│ - Submits form  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ POST /api/auth/  │
│ login           │
│ { email, pass } │
└──────┬───────────┘
       │
       ├─── 401/error ──▶ Show error message
       │
       ▼ 200 OK
┌──────────────────┐
│ Store JWT in     │
│ localStorage     │
│ key: admin_token │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Redirect to      │
│ /dashboard       │
└──────────────────┘

┌─────────────┐
│ API returns │
│ 401 on any  │
│ protected   │
│ route       │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ onUnauthorized   │
│ callback fires:  │
│ 1. Remove token  │
│ 2. Redirect     │
│    /login        │
└──────────────────┘
```

## Data Flow

```
User Action (click, form submit, delete)
         │
         ▼
┌─────────────────────────────────┐
│ Component (e.g., ServiceForm)   │
│ - Calls mutation hook           │
│ - useCreateService()            │
└─────────┬───────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│ TanStack Query Mutation         │
│ - mutationFn: async () => {    │
│     return apiClient.post()     │
│   }                            │
│ - onSuccess: invalidate queries │
│ - onError: show error          │
└─────────┬───────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│ API Client (from @jsoft/shared)│
│ - Attach Authorization header   │
│ - Fetch to /api/services        │
│ - Handle response/error         │
└─────────┬───────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│ Next.js API Route               │
│ - Validates JWT                 │
│ - Performs DB operation         │
│ - Returns JSON response         │
└─────────┬───────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│ Mutation Success                │
│ - Invalidate ['services'] query │
│ - Refetch list                  │
│ - Redirect or show success      │
└─────────────────────────────────┘

Read Flow (Query):
Component → useQuery hook → API Client → API Route → Response → Cache → Re-render
```

## BlogPost Editor

### TipTap Configuration (`components/blog-posts/TipTapEditor.tsx`)
```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  extensions: [StarterKit],
  content: initialContent,
  onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    onChange(html);
  },
});
```

### StarterKit Includes
- **Bold**, **Italic**, **Strike** markup
- **Heading** (levels 1-3)
- **BulletList**, **OrderedList**
- **Blockquote**
- **CodeBlock**, **Code**
- **HorizontalRule**
- **HardBreak**

### Validation Rules
1. **Content Length**: Minimum 100 characters (stripped of HTML tags)
2. **Title**: Required, min 3 chars (from BlogPostInput schema)
3. **Slug**: Auto-generated from title, editable
4. **Status**: DRAFT | PUBLISHED (from PostStatus type)
5. **Excerpt**: Optional, max 200 chars

### Helper Function for Validation
```typescript
function getTextFromHTML(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// Usage in validation:
const textContent = getTextFromHTML(content);
if (textContent.length < 100) {
  errors.content = ['Content must be at least 100 characters'];
}
```

## Routing Design

### React Router v7 Routes (`routes/index.tsx`)
```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '@jsoft/shared';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      
      // Dashboard
      { path: 'dashboard', element: <DashboardPage /> },
      
      // Services CRUD
      { path: 'services', element: <ServicesPage /> },
      { path: 'services/create', element: <ServiceCreate /> },
      { path: 'services/edit/:id', element: <ServiceEdit /> },
      
      // Products CRUD
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/create', element: <ProductCreate /> },
      { path: 'products/edit/:id', element: <ProductEdit /> },
      
      // Tools CRUD
      { path: 'tools', element: <ToolsPage /> },
      { path: 'tools/create', element: <ToolCreate /> },
      { path: 'tools/edit/:id', element: <ToolEdit /> },
      
      // SuccessCases CRUD
      { path: 'success-cases', element: <SuccessCasesPage /> },
      { path: 'success-cases/create', element: <SuccessCaseCreate /> },
      { path: 'success-cases/edit/:id', element: <SuccessCaseEdit /> },
      
      // BlogPosts CRUD
      { path: 'blog-posts', element: <BlogPostsPage /> },
      { path: 'blog-posts/create', element: <BlogPostCreate /> },
      { path: 'blog-posts/edit/:id', element: <BlogPostEdit /> },
      
      // ContactForms (read-only)
      { path: 'contact-forms', element: <ContactFormsPage /> },
      
      // Catch-all
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);
```

### ProtectedRoute Usage
The `DashboardLayout` wraps all admin routes and internally checks for authentication. Alternatively, wrap with ProtectedRoute:
```typescript
// In App.tsx
<QueryClientProvider client={queryClient}>
  <RouterProvider router={router} />
</QueryClientProvider>

// ProtectedRoute already handles redirect in @jsoft/shared
```

## Types/Interfaces

### Extended Types (`types/index.ts`)
```typescript
import type {
  ServiceInput,
  ServiceUpdateInput,
  ServiceFilterInput,
  ServiceResponse,
  ProductInput,
  ProductUpdateInput,
  ProductFilterInput,
  ProductResponse,
  ToolInput,
  ToolUpdateInput,
  ToolFilterInput,
  ToolResponse,
  SuccessCaseInput,
  SuccessCaseUpdateInput,
  SuccessCaseFilterInput,
  SuccessCaseResponse,
  BlogPostInput,
  BlogPostUpdateInput,
  BlogPostFilterInput,
  BlogPostStatusInput,
  BlogPostResponse,
  PostStatus,
  ContactFormResponse,
  LoginInput,
  LoginResponse,
  JwtPayload,
  PaginatedResponse,
  ApiError,
} from '@jsoft/shared';

// Re-export all from @jsoft/shared
export type {
  ServiceInput, ServiceUpdateInput, ServiceFilterInput, ServiceResponse,
  ProductInput, ProductUpdateInput, ProductFilterInput, ProductResponse,
  ToolInput, ToolUpdateInput, ToolFilterInput, ToolResponse,
  SuccessCaseInput, SuccessCaseUpdateInput, SuccessCaseFilterInput, SuccessCaseResponse,
  BlogPostInput, BlogPostUpdateInput, BlogPostFilterInput, BlogPostStatusInput, BlogPostResponse,
  PostStatus, ContactFormResponse, LoginInput, LoginResponse, JwtPayload,
  PaginatedResponse, ApiError,
};

// Admin-specific types
export interface AuthState {
  token: string | null;
  user: JwtPayload | null;
  isAuthenticated: boolean;
}

export interface DashboardSummary {
  totalServices: number;
  totalProducts: number;
  totalTools: number;
  totalBlogPosts: number;
  totalContacts: number;
  recentServices: ServiceResponse[];
  recentBlogPosts: BlogPostResponse[];
}

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

export interface PaginatedRequest {
  page: number;
  limit: number;
}

// TipTap content validation
export interface TipTapValidation {
  minChars: 100;
  getTextFromHTML(html: string): string;
}
```

### Key Schemas from @jsoft/shared (Relevant)
```typescript
// BlogPostInput (from @jsoft/shared)
interface BlogPostInput {
  title: string;
  content: string;  // TipTap HTML content
  excerpt?: string;
  slug?: string;
  status: PostStatus;  // 'DRAFT' | 'PUBLISHED'
  featuredImage?: string;
  tags?: string[];
}

// LoginInput (from @jsoft/shared)
interface LoginInput {
  email: string;
  password: string;
}

// LoginResponse (from @jsoft/shared)
interface LoginResponse {
  token: string;
  user: JwtPayload;
}
```

## File Changes

| File | Action | Grounded In |
|------|--------|------------|
| `admin-panel/src/api/client.ts` | Create | API client setup with 401 interceptor |
| `admin-panel/src/api/auth.ts` | Create | Login/logout/token utilities |
| `admin-panel/src/api/*.api.ts` | Create | 6 API files for each entity |
| `admin-panel/src/hooks/useAuth.ts` | Create | Auth state management |
| `admin-panel/src/hooks/use*.ts` | Create | 7 hooks per entity (42+ hooks total) |
| `admin-panel/src/components/layout/*` | Create | DashboardLayout, Sidebar, Header |
| `admin-panel/src/components/auth/LoginForm.tsx` | Create | Login form component |
| `admin-panel/src/components/*/List.tsx` | Create | 6 list components |
| `admin-panel/src/components/*/Form.tsx` | Create | 5 form components (not ContactForms) |
| `admin-panel/src/components/blog-posts/TipTapEditor.tsx` | Create | TipTap wrapper |
| `admin-panel/src/components/contact-forms/*` | Create | Read-only list + detail modal |
| `admin-panel/src/pages/*.tsx` | Create | 18+ page components |
| `admin-panel/src/routes/index.tsx` | Create | React Router v7 definitions |
| `admin-panel/src/types/index.ts` | Create | Extended TypeScript interfaces |
| `admin-panel/src/utils/*` | Create | Constants, drag helpers, slugify |
| `admin-panel/src/App.tsx` | Create | Router + QueryClientProvider |
| `admin-panel/src/main.tsx` | Create | Entry point |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Schema validation (Zod) | Test Zod schemas with valid/invalid inputs |
| Unit | Utility functions (slugify, dragHelpers) | Jest/Vitest tests |
| Integration | API client interceptors | Mock fetch, test 401 handling |
| Integration | TanStack Query hooks | Mock API, test query/mutation flow |
| Component | LoginForm | Test form submission, error display |
| Component | List components | Test pagination, filtering |
| Component | Form components | Test Zod validation, submission |
| Component | TipTapEditor | Test content change callback |
| E2E | Full auth flow | Playwright: login → redirect → logout |
| E2E | CRUD operations | Playwright: create → edit → delete |

**Note**: Per proposal, E2E tests are OUT OF SCOPE for initial implementation.

## Migration / Rollout
No migration required. This is a new admin-panel package. Deploy separately from client-site.

## Open Questions
- [ ] Should the admin-panel use the same Next.js API routes or a separate backend? (Current design assumes same Next.js API)
- [ ] What is the exact JWT payload structure? (JwtPayload from @jsoft/shared should define this)
- [ ] Should BlogPost slug auto-generation happen client-side or server-side? (Design assumes client-side with slugify utility)
- [ ] What is the exact reorder API signature for tools? (Assumes PATCH /api/tools/:id/reorder with `{ newOrder: number }`)
