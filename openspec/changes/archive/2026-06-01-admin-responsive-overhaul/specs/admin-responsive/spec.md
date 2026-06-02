# Admin Responsive Specification

## Purpose

Responsive layout infrastructure for the admin panel — sidebar overlay on mobile, hamburger menu, scrollable tables, and consistent responsive padding at 480/640/768/1024px breakpoints.

## Requirements

### Requirement: Sidebar Overlay on Mobile

On viewports < 768px, the sidebar MUST render as a fixed-position overlay above content with a backdrop. The sidebar MUST NOT shift `.content` when opening/closing. Desktop (>= 1024px) behavior MUST remain permanent with existing collapse/expand.

#### Scenario: Sidebar overlays content on mobile

- GIVEN the viewport is 375px wide
- AND the sidebar is open
- WHEN the user inspects `.layout`
- THEN `.sidebar` has `position: fixed` and overlaps `.content`
- AND the backdrop is visible

#### Scenario: Desktop sidebar remains unchanged

- GIVEN the viewport is 1280px wide
- WHEN the sidebar is rendered
- THEN it is permanently visible with current collapse/expand behavior
- AND `.content` is not covered

### Requirement: Hamburger Menu

On viewports < 768px, a hamburger button MUST appear in the Header (left side). It MUST have `aria-label="Abrir menú"` / `"Cerrar menú"`. It MUST close the sidebar on route change and MUST have a 44x44px minimum touch target.

#### Scenario: Hamburger opens and closes sidebar

- GIVEN the viewport is 375px wide
- WHEN the user taps the hamburger
- THEN the sidebar visibility toggles
- AND the aria-label updates to reflect state

#### Scenario: Sidebar closes on navigation

- GIVEN the sidebar is open on mobile
- WHEN the user taps a NavLink
- THEN the sidebar closes
- AND the backdrop is removed

### Requirement: Backdrop

The backdrop MUST cover the full viewport (`position: fixed; inset: 0`), MUST close the sidebar on click/tap, MUST set `overflow: hidden` on `<body>`, and MUST use a z-index between sidebar (`z-overlay`) and content.

#### Scenario: Backdrop prevents body scroll

- GIVEN the sidebar is open on mobile
- WHEN the user attempts to scroll the page
- THEN `body` has `overflow: hidden`

### Requirement: Touch Targets

All interactive elements in sidebar navLinks, hamburger, and table action buttons MUST have minimum 44x44px touch target on mobile (< 768px).

### Requirement: Scrollable Tables

Every data table (`<table>` in Dashboard, PagesList, and any table-like component) MUST be wrapped in `<div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>` so users can horizontally scroll when table exceeds viewport width.

#### Scenario: Table scrolls horizontally on narrow viewport

- GIVEN a data table with 6 columns
- WHEN the viewport is 375px wide
- THEN the table is horizontally scrollable via the wrapper

### Requirement: Settings Layout Stack

On viewports < 640px, the SettingsLayout grid `grid-template-columns: 200px 1fr` MUST switch to `grid-template-columns: 1fr` so the settings nav stacks above content.

#### Scenario: Settings nav stacks on mobile

- GIVEN the SettingsLayout page
- WHEN the viewport is 375px wide
- THEN nav appears above content (single column)

### Requirement: Form Container Padding

`.adminContainer` padding MUST reduce from 2rem to **1rem at < 640px** and **0.75rem at < 480px**.

#### Scenario: Form padding shrinks at mobile breakpoints

- GIVEN a form page (Create/Edit)
- WHEN the viewport is 375px wide
- THEN `.adminContainer` padding is 0.75rem

### Requirement: Header Responsive Padding

`header` padding MUST reduce from `0 var(--spacing-xl)` to `0 var(--spacing-md)` at < 640px.

### Requirement: Consistent Breakpoints

All responsive adaptations MUST use these media query widths: **480px, 640px, 768px, 1024px**. No other breakpoint values SHALL be introduced.

### Requirement: Tablet Sidebar (768–1023px)

The sidebar MAY remain collapsible on tablet with wider tap targets. It MUST NOT force overlay mode — the existing collapse/expand behavior is acceptable at this range.
