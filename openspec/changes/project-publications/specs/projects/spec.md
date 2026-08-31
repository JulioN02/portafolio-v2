# Projects Specification

## Purpose

Real `Project` entity for practice projects: minimal model, tag classification, API CRUD, admin, client `/proyectos` list/detail; only PUBLISHED, non-deleted rows public.

## Requirements

### Requirement: Project Model

The `Project` Prisma model MUST contain: `id`, `title`, `slug` (unique), `shortDescription`, `body` (rich HTML), `images`, `repositoryUrl` (optional), `tags`, `featured` (default false), `order` (default 0), `status` (PostStatus, default DRAFT), `deletedAt`, `publishedAt`, `createdAt`, `updatedAt`. Classification MUST be expressed via free-form `tags` (e.g. `proyecto-rapido`, `proyecto-profesional`); no rigid type enum SHALL exist.

#### Scenario: Model exposes minimal core fields

- GIVEN the Prisma schema after migration
- WHEN the Project model is inspected
- THEN it contains the core fields above and no type enum

#### Scenario: Tags carry classification

- GIVEN a project tagged ["proyecto-rapido", "pedagogico"]
- WHEN the project is fetched
- THEN tags drive filtering and no classification field is present

### Requirement: Shared Project Zod Schemas

`@jsoft/shared` MUST export `projectSchema`, `projectUpdateSchema`, `projectFilterSchema` (status, tag, search, page, limit), `projectStatusSchema`; `tags` MUST be trimmed strings (1–30 chars, max 10).

#### Scenario: Valid project input passes

- GIVEN a complete valid input incl. tags ["proyecto-rapido"] and repositoryUrl
- WHEN validated against projectSchema
- THEN validation passes

#### Scenario: Invalid tag rejected

- GIVEN input with an empty tag string or 11 tags
- WHEN validated against projectSchema
- THEN validation fails with a clear error

### Requirement: Project API CRUD

The API SHALL expose under `/api/projects`: GET `/` (public, filters status/tag/search/page/limit), GET `/:slug` (public, PUBLISHED + deletedAt null only), GET `/by-id/:id` (protected), POST `/` (protected), PUT `/:id`, DELETE `/:id` (soft-delete), PATCH `/:id/restore|status|reorder` (protected), GET `/tags` (public, distinct tags among PUBLISHED).

#### Scenario: Public list returns published only

- GIVEN projects in DRAFT and PUBLISHED status
- WHEN GET `/api/projects` is called without auth
- THEN only PUBLISHED, non-deleted projects are returned

#### Scenario: Public detail by slug

- GIVEN a PUBLISHED project
- WHEN GET `/api/projects/:slug` is called
- THEN body and tags are returned
- AND a DRAFT slug returns 404

#### Scenario: Admin writes

- GIVEN an authenticated admin
- WHEN POST `/api/projects` is called with valid data
- THEN 201 returns the project; DELETE `/:id` soft-deletes (hidden publicly); no JWT → 401

#### Scenario: Tags endpoint derives from published items

- GIVEN published projects tagged ["a","b"], a draft tagged ["c"]
- WHEN GET `/api/projects/tags` is called
- THEN only ["a","b"] are returned

### Requirement: Admin Project CRUD Pages

The admin panel SHALL provide list, create, and edit pages (`/admin/projects`, `/new`, `/:id`) with title, slug, shortDescription, rich body editor, images, repositoryUrl, tags, status, featured, and order fields. Tags MUST be entered freely with suggestions from existing tags.

#### Scenario: Create project with tags

- GIVEN an authenticated admin on the create page
- WHEN the form is filled and "Create" is clicked
- THEN POST `/api/projects` is called and the list redirects

#### Scenario: Edit prefills

- GIVEN an authenticated admin opens `/admin/projects/:id`
- WHEN the page loads
- THEN all fields including tags are pre-filled

### Requirement: Client Projects Pages

The client site SHALL render `/proyectos` (list of PUBLISHED projects with tag filter auto-populated from `/api/projects/tags`) and `/proyectos/:slug` (detail with sanitized rich body, images, repositoryUrl, tags).

#### Scenario: List shows published projects

- GIVEN published and draft projects
- WHEN the client visits `/proyectos`
- THEN only published projects appear
- AND selecting a tag chip re-fetches with `?tag=` and shows matching projects

#### Scenario: Detail page

- GIVEN a valid published project slug
- WHEN the client visits `/proyectos/:slug`
- THEN the detail renders sanitized body, images, and repository link
- AND an unknown slug shows a not-found state

## Testing Note

Strict TDD: api service tests MUST cover CRUD, PUBLISHED-only queries, soft-delete, tag filter, tags endpoint (70% coverage).

## Risks

- Route namespace: existing `/api/projects` aggregation must move to a portfolio path (recruiter-projects delta) to free the path for Project CRUD.
- Seed migration: existing free-text classification in seeds must map to tags (low impact).