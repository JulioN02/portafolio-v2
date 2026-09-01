# Delta for Blog Frontend Filters

## Domain

Blog post listing — category, tag, and search filters on Client Site and Recruiter Site.

## MODIFIED Requirements

### Requirement: Blog Grid (Recruiter Site)

The system SHALL fetch `GET /api/blog-posts?status=PUBLISHED` and display a grid with title, excerpt, coverImage, category, tags, and date. The system MUST add a category dropdown filter, a tag filter auto-populated from `GET /api/blog-posts/tags`, and a search input above the grid. Category options SHALL come from `GET /api/blog-posts/categories`. Search MUST use 300ms debounce and query `?search=` param. Category, tag, and search MUST combine with AND logic. Filter state MUST be persisted in URL query params (shareable URLs).
(Previously: Grid with category dropdown and search only, no tag filter)

#### Scenario: Category dropdown filters posts

- GIVEN user visits `/blog`
- WHEN user selects a category from the dropdown
- THEN the grid updates to show only posts in that category
- AND the URL updates to `?category=selected-category`

#### Scenario: Tag filter filters posts

- GIVEN the tag filter is populated from `/api/blog-posts/tags`
- WHEN user selects tag "react"
- THEN the grid updates to show only posts containing "react"
- AND the URL updates to `?tag=react`

#### Scenario: Search input filters posts

- GIVEN user visits `/blog`
- WHEN user types in the search input
- THEN after 300ms of inactivity, the API is called with `?search=typed-text`
- AND the grid updates to show matching posts

#### Scenario: Category + tag + search combined (AND)

- GIVEN user has selected a category, a tag, and typed a search term
- WHEN all filters are active
- THEN the API is called with `?category=X&tag=Y&search=Z`
- AND only posts matching ALL conditions are returned

#### Scenario: Filter state in URL params

- GIVEN user selects category "development", tag "react", and searches "hooks"
- WHEN the page URL is inspected
- THEN it contains `?category=development&tag=react&search=hooks`
- WHEN the URL is shared and opened
- THEN the filters are pre-applied

### Requirement: Client Site Blog Page

The Client Site blog page SHALL fetch published blog posts with pagination. The system MUST add a category dropdown filter, a tag filter auto-populated from `/api/blog-posts/tags`, and a search input above the grid. Category options SHALL come from the categories endpoint. Search MUST use 300ms debounce. Category, tag, and search MUST combine with AND logic. Filter state MUST persist in URL query params.
(Previously: Basic grid with pagination, category and search filters only, no tag filter)

#### Scenario: Client blog shows category filter

- GIVEN user visits the Client Site blog
- WHEN the page renders
- THEN a category dropdown appears above the grid
- AND selecting a category updates the grid and URL

#### Scenario: Client blog tag filter

- GIVEN the tag filter is populated from published tags
- WHEN user selects a tag
- THEN the grid updates and the URL contains `?tag=`

#### Scenario: Client blog search with debounce

- GIVEN user visits the Client Site blog
- WHEN user types in the search input
- THEN the API is called 300ms after the user stops typing
- AND results update without page reload

#### Scenario: Client blog combined filters in URL

- GIVEN user selects a category, a tag, and types a search
- WHEN the URL is read
- THEN it contains `?category=X&tag=Y&search=Z`
- AND sharing the URL reproduces the same filtered view

## Testing Note

Frontend behavior (no api test impact). API tag filter and tags endpoint are tested in the blog-tags and blog-post-api deltas (api package, strict TDD).