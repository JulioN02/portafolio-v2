# Tasks: Admin Panel Responsive Overhaul

## Phase 1: Sidebar + Hamburger (Core Layout)

- [x] 1.1 **DashboardLayout.tsx** — Add `isSidebarOpen` state, `isMobile` via `matchMedia('max-width: 767px')`, `useLocation` route-close effect, backdrop `<div>` with `onClick` close, body `overflow: hidden` effect
- [x] 1.2 **Sidebar.tsx** — Add `isOpen`/`onClose`/`isMobile` props, guard desktop collapse button behind `!isMobile`, call `onClose` on NavLink click when mobile
- [x] 1.3 **Sidebar.module.css** — Add `@media (max-width: 767px)` block: `position: fixed`, `transform: translateX(-100%)` → `translateX(0)`, `z-index: var(--z-overlay)`, `width: 280px`
- [x] 1.4 **Header.tsx** — Add hamburger `<button>` with `onToggleSidebar`/`isSidebarOpen` props, dynamic `aria-label` ("Abrir menú"/"Cerrar menú"), 44×44px touch target
- [x] 1.5 **Header.module.css** — Add hamburger styles, `display: none` above 768px, `padding: 0 var(--spacing-md)` at <640px
- [x] 1.6 **DashboardLayout.module.css** — Add backdrop class (`position: fixed; inset: 0; z-index: calc(var(--z-overlay) - 1)`), responsive `.main` padding `1rem` at <640px

## Phase 2: Table Scroll Wrappers

- [x] 2.1 **form.module.css** — Add `.tableWrapper` class: `overflow-x: auto; -webkit-overflow-scrolling: touch`
- [x] 2.2 **Dashboard.tsx** — Change table container `overflow: 'hidden'` to `overflowX: 'auto'`
- [x] 2.3 **ToolsList.tsx** — Wrap `<ToolList />` in `<div className={formStyles.tableWrapper}>`
- [x] 2.4 **BlogPostsListPage.tsx** — Wrap `<BlogPostList />` in `<div className={formStyles.tableWrapper}>`

## Phase 3: Settings + Forms Responsive

- [x] 3.1 **Create** `SettingsLayout.module.css` — `display: grid; grid-template-columns: 200px 1fr; gap: 2rem;` with `@media (max-width: 639px) → 1fr`
- [x] 3.2 **SettingsLayout.tsx** — Replace inline `style={{display:'grid', gridTemplateColumns:'200px 1fr'}}` with CSS module class
- [x] 3.3 **form.module.css** — Add responsive `.adminContainer` padding: `1rem` at <640px, `0.75rem` at <480px

## Phase 4: Polish + Verify

- [x] 4.1 **index.css** — Add `body.sidebar-open { overflow: hidden }` class for body scroll lock
- [x] 4.2 **Type check** — Run `pnpm --filter @jsoft/admin-panel exec tsc --noEmit` — fix any type errors
- [x] 4.3 **Manual verification** — Test all breakpoints: 375px (overlay, scroll lock, 44px targets), 480px/640px (padding), 768px (sidebar overlay boundary), 1024px+ (desktop unchanged)
