# Proposal: Admin Panel Responsive Overhaul

## Intent

Admin panel has only 2 media queries. At <1024px: sidebar shifts content instead of overlaying, toggle is inside sidebar (inaccessible on mobile), tables overflow, settings grid breaks, form padding excessive (2rem). Unusable on mobile/tablet.

## Scope

### In Scope
- Sidebar overlay on mobile (<768px) with hamburger menu in header
- Breakpoints at 480px, 640px, 768px, 1024px
- Table `overflow-x: auto` wrappers on all admin tables
- Settings layout: stack nav above content on mobile
- Form + header responsive padding

### Out of Scope
- Client site responsive, Blog/Services/Products visual design, API changes, Portafolio V1 patterns

## Capabilities

### New Capabilities
- `admin-responsive`: Responsive layout infrastructure — sidebar mobile overlay, hamburger menu, breakpoints, scrollable tables, responsive form/settings/padding

### Modified Capabilities
- None

## Approach

- **Sidebar overlay (<768px)**: Fixed position + backdrop. Hamburger in Header (top-left). State lifted to DashboardLayout via context. Closes on route change.
- **Breakpoints**: 480/640/768/1024px — matching client-site.
- **Tables**: Wrap each `<table>` in `<div style={{overflowX: 'auto'}}>`.
- **Settings**: Switch grid to single column at <640px.
- **Forms**: `.adminContainer` padding: 2rem → 1rem at <640px, 0.75rem at <480px.
- **Header**: padding: 0 var(--spacing-xl) → 0 var(--spacing-md) at <640px.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `Sidebar.tsx` + `.module.css` | Modified | Remove toggle, overlay + backdrop |
| `DashboardLayout.tsx` + `.module.css` | Modified | Lift sidebar state, media queries |
| `Header.tsx` + `.module.css` | Modified | Hamburger, responsive padding |
| `form.module.css` | Modified | Responsive padding |
| `SettingsLayout.tsx` | Modified | Stack grid at <640px |
| `Dashboard.tsx` + 6 list pages | Modified | Table overflow wrappers |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Overlay z-index conflicts | Low | Use `--z-overlay` |
| Hamburger state lost on nav | Low | Close on route change |
| Scroll lock missing | Med | Add `overflow: hidden` on body |

## Rollback Plan

Revert Sidebar.tsx, DashboardLayout.tsx, Header.tsx + CSS modules. Each is isolated — no shared schemas or API changes. Verify with `pnpm --filter @jsoft/admin-panel exec tsc --noEmit`.

## Dependencies

- None (CSS + component changes only)

## Success Criteria

- [ ] Sidebar overlays on <768px (no content shift, backdrop visible)
- [ ] Hamburger visible in Header on mobile, opens/closes sidebar
- [ ] No admin table causes horizontal scroll at 375px
- [ ] Settings layout stacks vertically at <640px
- [ ] Form padding ≤1rem on mobile
- [ ] All interactive elements ≥44px touch target
- [ ] `pnpm -r run typecheck` passes
