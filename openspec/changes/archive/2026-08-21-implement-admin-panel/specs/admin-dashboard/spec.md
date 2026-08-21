# Admin Dashboard Specification

## Purpose

Main layout and dashboard page for admin panel with sidebar navigation and header.

## Requirements

### Requirement: Dashboard Layout

The system SHALL provide a DashboardLayout component with sidebar (left) and header (top) wrapping all admin pages. Sidebar MUST contain navigation links to all CRUD pages and be collapsible.

#### Scenario: Dashboard layout renders correctly

- GIVEN user is authenticated
- WHEN user navigates to any `/admin/*` route (except login)
- THEN system renders sidebar with nav links, header with user info and logout

#### Scenario: Sidebar navigation works

- GIVEN user is on dashboard
- WHEN user clicks "Services" in sidebar
- THEN system navigates to `/admin/services` and highlights "Services" link

#### Scenario: Sidebar collapses on mobile

- GIVEN user is on dashboard with viewport < 768px
- WHEN page loads
- THEN sidebar is collapsed by default, hamburger menu toggles it

### Requirement: Dashboard Page

The system SHALL provide a dashboard home page at `/admin/dashboard` showing summary cards (total services, products, tools, blog posts, contact forms) and recent activity.

#### Scenario: Dashboard shows summary

- GIVEN user is authenticated
- WHEN user visits `/admin/dashboard`
- THEN system displays count cards for all entities and recent items list

#### Scenario: Dashboard data refreshes

- GIVEN user is on dashboard
- WHEN page loads or user clicks refresh
- THEN system fetches latest counts using TanStack Query
