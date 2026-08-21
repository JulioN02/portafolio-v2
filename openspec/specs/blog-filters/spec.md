# Delta: Blog Frontend Filters

## Domain

Blog post listing — category filter and search on Client Site and Recruiter Site.

## MODIFIED Requirements

### Requirement: Blog Grid (Recruiter Site)

The system SHALL fetch `GET /api/blog-posts?status=PUBLISHED` and display a grid with title, excerpt, coverImage, category, and date. The system MUST add a category dropdown filter and a search input above the grid. Category options SHALL come from `GET /api/blog-posts/categories`. Search MUST use 300ms debounce and query `?search=` param. Category filter and search MUST combine with AND logic. Filter state MUST be persisted in URL query params (shareable URLs).
(Previously: Grid only, no category filter or search)

#### Scenario: Category dropdown filters posts

- GIVEN user visits `/blog`
- WHEN user selects a category from the dropdown
- THEN the grid updates to show only posts in that category
- AND the URL updates to `?category=selected-category`

#### Scenario: Search input filters posts

- GIVEN user visits `/blog`
- WHEN user types in the search input
- THEN after 300ms of inactivity, the API is called with `?search=typed-text`
- AND the grid updates to show matching posts

#### Scenario: Category + search combined (AND)

- GIVEN user has selected a category and typed a search term
- WHEN both filters are active
- THEN the API is called with both `?category=X&search=Y`
- AND only posts matching BOTH conditions are returned

#### Scenario: Filter state in URL params

- GIVEN user selects category "development" and searches "react"
- WHEN the page URL is inspected
- THEN it contains `?category=development&search=react`
- WHEN the URL is shared and opened
- THEN the filters are pre-applied

### MODIFIED Requirements: Client Site Blog Page

The Client Site blog page SHALL fetch published blog posts with pagination. The system MUST add a category dropdown filter and search input above the grid. Category options SHALL come from the categories endpoint. Search MUST use 300ms debounce. Category and search MUST combine with AND logic. Filter state MUST persist in URL query params.
(Previously: Basic grid with pagination only, no category filter or search)

#### Scenario: Client blog shows category filter

- GIVEN user visits the Client Site blog
- WHEN the page renders
- THEN a category dropdown appears above the grid
- AND selecting a category updates the grid and URL

#### Scenario: Client blog search with debounce

- GIVEN user visits the Client Site blog
- WHEN user types in the search input
- THEN the API is called 300ms after the user stops typing
- AND results update without page reload

#### Scenario: Client blog combined filters in URL

- GIVEN user selects a category and types a search
- WHEN the URL is read
- THEN it contains both `?category=X&search=Y`
- AND sharing the URL reproduces the same filtered view

## ADDED Requirements

### Requirement: BlogPost Filter Schema Extension

The shared `blogPostFilterSchema` MUST gain an optional `search: z.string().optional()` field.

#### Scenario: Search field accepted in filter schema

- GIVEN a filter input with `{ search: "react" }` 
- WHEN validated against `blogPostFilterSchema`
- THEN validation passes and the search field is present

### Requirement: API Blog Post Search Support

The blog post service `findAll` MUST support a `search` parameter that performs case-insensitive contains search across `title`, `shortDescription`, and `body`.

#### Scenario: Search in blog post API

- GIVEN published blog posts exist with varying titles and content
- WHEN `GET /api/blog-posts?search=javascript` is called
- THEN only posts where title, shortDescription, or body contains "javascript" (case-insensitive) are returned
