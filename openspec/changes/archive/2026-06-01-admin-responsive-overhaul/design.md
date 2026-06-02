# Design: Admin Panel Responsive Overhaul

## Overview

Pure CSS + component changes to make the admin panel usable on mobile/tablet. No API or schema changes. Stack: React 19 + Vite 6 + CSS Modules.

## Technical Approach

Lift sidebar open/close state to `DashboardLayout`, detect mobile via `matchMedia`, and switch sidebar from inline flex layout to fixed overlay at viewports < 768px. Hamburger in Header controls the toggle. Tables get scroll wrappers. Padding and grids respond at 480/640/768/1024px breakpoints matching the client site.

## Architecture Decisions

### Decision 1: Sidebar Overlay vs Inline Slide

**Choice**: Fixed overlay (`position: fixed` + `transform: translateX`) at < 768px, current inline flex layout at >= 768px.
**Alternatives**: CSS-only `position: absolute` slide (breaks scroll context), always-overlay (bad for tablets).
**Rationale**: Fixed overlay avoids content reflow. Transform is GPU-accelerated for smooth 60fps animation. The 768px threshold matches common tablet portrait widths (iPad = 768px) so sidebar stays accessible inline on tablets.

### Decision 2: State Ownership

**Choice**: `isSidebarOpen` state in `DashboardLayout`, passed down as props to `Sidebar` and `Header`.
**Alternatives**: React Context (overkill for one boolean), CSS-only checkbox hack (inaccessible, no route-change close).
**Rationale**: Props keep the data flow explicit. `DashboardLayout` owns layout — it's the natural place. Route change auto-close via `useLocation` effect.

### Decision 3: Mobile Detection

**Choice**: `window.matchMedia('(max-width: 767px)')` in a `useEffect` + `useState<boolean>`.
**Alternatives**: CSS-only media queries in modules (can't drive JS logic), `react-responsive` package (extra dependency).
**Rationale**: matchMedia is native, zero-dependency, and already used in `ContactMessagesListPage`. Re-renders only on breakpoint crossing, not on resize.

### Decision 4: Backdrop Lock

**Choice**: Fixed backdrop with `overflow: hidden` on `<body>` when sidebar open on mobile.
**Alternatives**: `event.preventDefault()` on touchmove (breaks nested scrollable areas), no scroll lock (content scrolls behind backdrop).
**Rationale**: `overflow: hidden` on body is the standard pattern. Cleaned up in the `useEffect` return. Backdrop z-index: `calc(var(--z-overlay) - 1)` — between content and sidebar.

### Decision 5: Table Scroll Wrapper

**Choice**: `overflow-x: auto` on `.tableWrapper` plus explicit wrappers on all list pages.
**Alternatives**: CSS `overflow: scroll` always visible (ugly on desktop), `max-width: 100vw` (inconsistent).
**Rationale**: `overflow-x: auto` only shows scrollbar when content overflows. `-webkit-overflow-scrolling: touch` for smooth iOS momentum scrolling.

## Component Changes

### Sidebar.tsx + Sidebar.module.css

- **Props**: Add `isOpen: boolean`, `onClose: () => void`, `isMobile: boolean`
- **Desktop**: Keep existing `isCollapsed` state + toggle button (behind `!isMobile` guard)
- **Mobile**: Remove toggle button. Sidebar renders at full width, visibility via `transform: translateX()` from CSS
- **NavLink click**: Call `onClose` on mobile → closes sidebar on navigation
- **CSS additions**: `@media (max-width: 767px)` block with fixed positioning, z-index `var(--z-overlay)`, transform slide animation

### DashboardLayout.tsx + DashboardLayout.module.css

- **State**: `const [isSidebarOpen, setIsSidebarOpen] = useState(false)`
- **Mobile detection**: `const [isMobile, setIsMobile] = useState(false)` with matchMedia effect
- **Route change**: `useLocation()` effect calls `setIsSidebarOpen(false)`
- **Backdrop**: Rendered when `isMobile && isSidebarOpen`, `onClick={() => setIsSidebarOpen(false)}`
- **Body lock**: `useEffect` sets `document.body.style.overflow` based on sidebar state
- **Responsive main padding**: `@media (max-width: 639px)` → `padding: 1rem`

### Header.tsx + Header.module.css

- **Props**: Add `onToggleSidebar: () => void`, `isSidebarOpen: boolean`
- **Hamburger**: Rendered at left side, visible only at < 768px via CSS `display: none`
- **Layout**: Change `justify-content: flex-end` → `justify-content: space-between` on mobile, or use absolute positioning for hamburger
- **CSS**: `aria-label` dynamic text, 44x44px touch target, `@media (max-width: 639px)` padding reduction

### SettingsLayout.tsx (+ new SettingsLayout.module.css)

- Create `SettingsLayout.module.css` with responsive grid
- Replace inline `style={{ display: 'grid', gridTemplateColumns: '200px 1fr' }}` with CSS module class
- `@media (max-width: 639px)` → `grid-template-columns: 1fr`

### Table Pages (Dashboard.tsx, ToolsList.tsx, BlogPostsListPage.tsx)

- **Dashboard.tsx**: Change `overflow: 'hidden'` to `overflowX: 'auto'` on table container
- **ToolsList.tsx**: Wrap `<ToolList />` in `<div className={formStyles.tableWrapper}>`
- **BlogPostsListPage.tsx**: Wrap `<BlogPostList />` in `<div className={formStyles.tableWrapper}>`

## CSS Strategy

| Breakpoint | Changes |
|------------|---------|
| < 480px | `.adminContainer` padding: 0.75rem |
| < 640px | `.adminContainer` padding: 1rem, `.header` padding: `0 var(--spacing-md)`, `.main` padding: 1rem, `.settingsGrid` → 1fr |
| < 768px | Sidebar overlay mode, hamburger visible, backdrop active |
| >= 1024px | Desktop full layout (no change from current) |

**Design tokens used**: `--z-overlay: 300` (sidebar), `--z-sticky: 200` (backdrop), `--spacing-xl/md/sm` (padding), `--color-neutral-0/50/200` (backdrop bg), responsive breakpoints as constants.

## File Changes

| File | Action | Details |
|------|--------|---------|
| `Sidebar.tsx` | Modify | Add `isOpen`/`onClose`/`isMobile` props, conditionally render toggle |
| `Sidebar.module.css` | Modify | Add `@media (max-width: 767px)` fixed overlay + transform slide |
| `DashboardLayout.tsx` | Modify | Lift sidebar state, add matchMedia, backdrop, body lock, route close |
| `DashboardLayout.module.css` | Modify | Add backdrop styles, responsive `.main` padding |
| `Header.tsx` | Modify | Add hamburger button, toggle prop |
| `Header.module.css` | Modify | Add hamburger styles, responsive padding |
| `SettingsLayout.tsx` | Modify | Replace inline grid with CSS module |
| `SettingsLayout.module.css` | **Create** | Responsive grid with media query |
| `form.module.css` | Modify | `.tableWrapper` → `overflow-x: auto`, responsive `.adminContainer` padding |
| `Dashboard.tsx` | Modify | Table container `overflowX: 'auto'` |
| `ToolsList.tsx` | Modify | Wrap in `formStyles.tableWrapper` |
| `BlogPostsListPage.tsx` | Modify | Wrap in `formStyles.tableWrapper` |
| `index.css` | Modify | Add `body.sidebar-open` class or use inline overflow |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Manual | Sidebar overlay | Resize to 375px, open sidebar → verify fixed overlay + backdrop, no content shift |
| Manual | Hamburger | Verify 44x44px target, aria-label updates, opens/closes sidebar |
| Manual | Route close | Open sidebar on mobile, tap nav link → sidebar closes |
| Manual | Tables | Stretch columns past viewport → verify overflow-x scroll |
| Manual | Settings grid | Resize < 640px → verify single column stack |
| Manual | Form padding | Verify 0.75rem at 375px, 1rem at 600px, 2rem at 1024px+ |
| Compile | TypeScript | `pnpm --filter @jsoft/admin-panel exec tsc --noEmit` — no errors |

## Rollout

No migration needed. All changes are CSS + component-only. Revert by reverting the 12 modified files and deleting `SettingsLayout.module.css`. Verify with `tsc --noEmit`.
