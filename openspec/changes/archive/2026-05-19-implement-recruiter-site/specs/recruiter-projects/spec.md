# Recruiter Projects Specification

## Purpose

Aggregated project listing with classification/type filters, pagination, and a detail modal that fetches technical content from individual endpoints.

## Requirements

### Requirement: Project Listing

The system SHALL fetch `GET /api/projects` and display a filterable, paginated list of project cards.

#### Scenario: Render project list

- GIVEN user visits `/proyectos`
- WHEN projects load
- THEN list shows cards with title, description, classification, type, and thumbnail

#### Scenario: Filter by classification

- GIVEN project list is displayed
- WHEN user selects a classification filter
- THEN list re-fetches with classification query param and shows matching results

#### Scenario: Paginate results

- GIVEN project list has multiple pages
- WHEN user clicks pagination control
- THEN list displays the next/previous page

### Requirement: Detail Modal

The system SHALL open a modal on project click, fetching the individual entity endpoint for `technicalExplanation` (sanitized via DOMPurify) and `technicalImages`.

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

#### Scenario: Entity not found

- GIVEN user clicks a project
- WHEN the individual endpoint returns 404
- THEN modal shows "Project not found" error state

#### Scenario: Close modal

- GIVEN modal is open
- WHEN user clicks close button or backdrop
- THEN modal closes and page scroll position is preserved
