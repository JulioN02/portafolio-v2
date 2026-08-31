# Blog Tags Specification

## Purpose

Dynamic tags for BlogPost: free entry with suggestions from existing tags, public tag filter auto-populated from distinct tags in use among published posts, and admin tag editing. No hardcoded closed list.

## Requirements

### Requirement: BlogPost Tags Field

The BlogPost model MUST gain `tags String[]`. The shared `blogPostSchema` MUST accept `tags` (array of trimmed strings, 1–30 chars, max 10) and `blogPostFilterSchema` MUST gain an optional `tag`. The existing free-text `category` SHALL be kept for API compatibility and derived from the first tag on write.

#### Scenario: Tags stored on create

- GIVEN a valid blog post payload with tags ["laboratorio", "react"]
- WHEN POST `/api/blog-posts` is called
- THEN the post is stored with both tags

#### Scenario: Category derived from first tag

- GIVEN a post created with tags ["experimento"]
- WHEN the post is fetched
- THEN category equals "experimento"

#### Scenario: Empty tags allowed

- GIVEN a post payload without tags
- WHEN validated against blogPostSchema
- THEN validation passes (tags optional)

### Requirement: Tag Suggestions Endpoint

The API MUST expose GET `/api/blog-posts/tags` returning the distinct tags in use among PUBLISHED, non-deleted posts, sorted.

#### Scenario: Suggestions from published posts

- GIVEN published posts tagged ["a","b"] and draft posts tagged ["c"]
- WHEN GET `/api/blog-posts/tags` is called
- THEN only ["a","b"] are returned

### Requirement: Tag Filter

`GET /api/blog-posts?tag=X` MUST return PUBLISHED, non-deleted posts containing tag X. Tag MUST combine with existing category and search filters using AND logic.

#### Scenario: Filter by tag

- GIVEN published posts with and without tag "react"
- WHEN GET `/api/blog-posts?tag=react` is called
- THEN only posts containing "react" are returned

#### Scenario: Combined filters

- GIVEN filters category=X and tag=Y
- WHEN GET `/api/blog-posts?category=X&tag=Y` is called
- THEN only posts matching BOTH are returned

### Requirement: Admin Tag Editor

The admin blog post form MUST provide a free-entry tag input with suggestions fetched from `/api/blog-posts/tags`; suggestions MUST update as tags are used. No hardcoded list SHALL exist.

#### Scenario: Free entry with suggestions

- GIVEN an authenticated admin editing a post
- WHEN the admin types in the tag input
- THEN matching existing tags are suggested and the admin may accept them or type a new tag

### Requirement: Tag Migration

A seed/data migration MUST map each existing free-text `category` value to a first tag on existing posts; posts without a meaningful category MAY receive no tags.

#### Scenario: Existing categories become tags

- GIVEN posts with category "laboratorio"
- WHEN the migration runs
- THEN each post has tags ["laboratorio"] and category stays "laboratorio"

## Testing Note

Strict TDD: blog-post service tests MUST cover tag storage, tag filter, tags endpoint, and derived category (api package, 70% coverage).

## Risks

- Migration may orphan seeds if category values are empty (low; mitigation: empty category maps to no tags).