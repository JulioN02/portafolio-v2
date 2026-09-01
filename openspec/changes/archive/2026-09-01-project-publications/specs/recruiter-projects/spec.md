# Delta for Recruiter Projects

## MODIFIED Requirements

### Requirement: Project Listing

The system SHALL fetch the portfolio aggregation endpoint and display a filterable, paginated list of project cards. The aggregation MUST merge real Project rows (Project model), Service, Product, Tool, SuccessCase, and blog posts tagged `laboratorio` or `experimento` (rendered as type `laboratorio`); blog posts tagged `articulo` MUST be excluded. Every source MUST be filtered to `status=PUBLISHED` and `deletedAt=null` — no other status may appear. Classification filters MUST cover tags for real projects and classification for legacy types.
(Previously: fetched GET /api/projects aggregation with no status filter; only Service/Product/Tool/SuccessCase sources; DRAFT/PRIVATE rows leaked)

#### Scenario: Render project list

- GIVEN user visits `/proyectos`
- WHEN projects load
- THEN list shows cards with title, description, classification/tags, type, and thumbnail

#### Scenario: Only published rows appear

- GIVEN rows exist in DRAFT, PRIVATE, and PUBLISHED status across all sources
- WHEN the aggregation is fetched
- THEN only PUBLISHED, non-deleted rows are returned

#### Scenario: Lab blog posts count as projects

- GIVEN a published blog post tagged "laboratorio"
- WHEN the aggregation is fetched
- THEN the post appears as a project with type "laboratorio"

#### Scenario: Articles excluded

- GIVEN a published blog post tagged "articulo"
- WHEN the aggregation is fetched
- THEN the post does NOT appear in the listing

#### Scenario: Filter by classification

- GIVEN project list is displayed
- WHEN user selects a classification filter
- THEN list re-fetches with classification query param and shows matching results

#### Scenario: Paginate results

- GIVEN project list has multiple pages
- WHEN user clicks pagination control
- THEN list displays the next/previous page

### Requirement: Detail Modal

The system SHALL open a modal on project click, fetching the individual entity endpoint for `technicalExplanation` (sanitized via DOMPurify) and `technicalImages`, or — for real Project rows — `GET /api/projects/:slug` rendering the sanitized rich body, images, tags, and repositoryUrl.
(Previously: only Service/Product/Tool cases existed; no real Project entity case)

#### Scenario: Open modal for Service

- GIVEN user clicks a project with `classification=SERVICE`
- WHEN modal opens
- THEN system fetches `GET /api/services/:slug` and renders sanitized technicalExplanation + technicalImages

#### Scenario: Open modal for Product

- GIVEN user clicks a project with `classification=PRODUCT`
- WHEN modal opens
- THEN system fetches `GET /api/products/:slug` and renders technical content

#### Scenario: Open modal for Tool

- GIVEN user clicks a project with `classification=TOOL`
- WHEN modal opens
- THEN system fetches `GET /api/tools/:slug` and renders technical content

#### Scenario: Open modal for real Project

- GIVEN user clicks a project of type "project" (real Project row)
- WHEN modal opens
- THEN system fetches `GET /api/projects/:slug` and renders sanitized body, images, tags, and repository link

#### Scenario: Entity not found

- GIVEN user clicks a project
- WHEN the individual endpoint returns 404
- THEN modal shows "Project not found" error state

#### Scenario: Close modal

- GIVEN modal is open
- WHEN user clicks close button or backdrop
- THEN modal closes and page scroll position is preserved

## Testing Note

Strict TDD: projects.service tests MUST assert PUBLISHED-only + deletedAt null aggregation across ALL sources (regression guard for the status leak), including lab-post inclusion and article exclusion.

## Risks

- Aggregation endpoint path changes from `/api/projects` to a dedicated portfolio path to free the namespace for Project CRUD (route reconciliation, see projects spec).
- Status leak regression (medium): guarded by service tests.