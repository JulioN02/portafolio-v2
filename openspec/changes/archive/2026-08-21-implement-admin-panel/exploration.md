## Exploration: implement-admin-panel

### Current State
The admin-panel is currently empty (no src/ directory). The API is fully implemented with Express + Prisma + JWT + Zod, providing complete CRUD for Services, Products, Tools, SuccessCases, and ContactForms, plus authentication. The shared package has reusable UI components (Button, Input, Card, Modal, Loading, ErrorMessage), Zod schemas for all entities, and a fetch-based API client with JWT support. The client-site is functional with React 19 + Vite + React Router v7 + TanStack Query, providing patterns to follow.

### Affected Areas
- `admin-panel/src/` — Needs to be created with complete admin interface
- `admin-panel/package.json` — Already configured with dependencies (React 19, React Router v7, TanStack Query, @tiptap/react)
- `packages/shared/src/` — Reuse components, schemas, and API client
- `api/src/` — API already implemented, admin-panel just consumes it
- `admin-panel/vite.config.ts` — Already configured with proxy to API

### Approaches

1. **Mirror client-site structure** — Replicate the client-site folder structure (pages/, components/, hooks/, api/) with admin-specific pages
   - Pros: Consistency across projects, familiar patterns for developers
   - Cons: Admin needs different layout (sidebar, dashboard) vs client-site's public layout
   - Effort: Low

2. **Admin template with layout wrapper** — Create a Dashboard layout with sidebar navigation, header with user info/logout
   - Pros: Standard admin UX, clear separation from public site
   - Cons: More initial setup required
   - Effort: Medium

3. **Feature-based folder structure** — Organize by feature (services/, products/, etc.) with each containing pages, components, hooks
   - Pros: Scalable, easy to find related files
   - Cons: Less consistency with client-site
   - Effort: Medium

### Recommendation
Use a **hybrid approach**: Mirror client-site's top-level structure (pages/, components/, hooks/, api/) but with an admin-specific layout wrapper. Each page folder in pages/ should contain list, create, and edit pages for each entity. Use the Dashboard layout with sidebar navigation. This maintains consistency while providing proper admin UX.

Structure:
```
admin-panel/src/
├── api/
│   └── client.ts          # Configure api-client with JWT and logout callback
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx   # Sidebar + header layout
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── forms/             # Reusable forms for each entity
│   └── common/            # Admin-specific common components
├── pages/
│   ├── Login/
│   │   └── index.tsx
│   ├── Dashboard/
│   │   └── index.tsx      # Overview with stats
│   ├── Services/
│   │   ├── ListPage.tsx
│   │   ├── CreatePage.tsx
│   │   └── EditPage.tsx
│   ├── Products/
│   ├── Tools/
│   ├── SuccessCases/
│   ├── BlogPosts/         # Note: API not implemented yet
│   └── ContactForms/
│       └── ListPage.tsx
├── hooks/
│   ├── useAuth.ts         # Login, logout, get current user
│   ├── useServices.ts
│   ├── useProducts.ts
│   └── ...
├── App.tsx
└── main.tsx
```

### Risks
- BlogPost API routes not implemented (only schema exists in shared) — need to implement API first or defer blog feature
- Projects API has only public routes (no CRUD) — clarify if admin needs project management
- Rich text editing for blog posts requires @tiptap/react (already in dependencies)
- File uploads need proper handling (upload routes exist in API)
- JWT token storage (localStorage vs httpOnly cookie) — recommend localStorage with secure flag for SPA

### Ready for Proposal
Yes — The exploration provides clear structure and identifies that API is ready for most entities. The orchestrator should tell the user:
1. BlogPost API needs to be implemented (only schema exists)
2. Projects entity has no admin CRUD (only public GET routes)
3. Recommend implementing in order: Auth/Login → Dashboard → Services → Products → Tools → SuccessCases → ContactForms → BlogPosts (after API implementation)
