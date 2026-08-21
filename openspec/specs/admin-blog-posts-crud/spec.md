# Admin Blog Posts CRUD Specification

## Purpose

Complete CRUD management for BlogPost entity in admin panel with TipTap rich text editor.

## Requirements

### Requirement: List Blog Posts

The system SHALL provide a page at `/admin/blog-posts` displaying all blog posts in a table with columns: title, category, status, published date, actions. Table MUST support filtering by status (DRAFT, PUBLISHED, PRIVATE, ARCHIVED).

#### Scenario: Blog posts list loads

- GIVEN user is authenticated
- WHEN user navigates to `/admin/blog-posts`
- THEN system displays table with all posts, status filter dropdown

#### Scenario: Filter by status

- GIVEN user is on blog posts list
- WHEN user selects "PUBLISHED" from status filter
- THEN system shows only published posts

#### Scenario: Change post status

- GIVEN user is on blog posts list
- WHEN user clicks status badge to change it
- THEN system calls PATCH `/api/blog-posts/:id/status`, updates in table

### Requirement: Create Blog Post

The system SHALL provide a form page at `/admin/blog-posts/new` with fields: title, slug, category, shortDescription, coverImage, mediaGallery, body (TipTap editor), externalLink, lessonsLearned, status. Form MUST validate using Zod schema.

#### Scenario: Create blog post with TipTap

- GIVEN user is on `/admin/blog-posts/new`
- WHEN user fills fields including body in TipTap editor, clicks "Create"
- THEN system calls POST `/api/blog-posts`, redirects to list

#### Scenario: Slug auto-generation

- GIVEN user is creating a blog post
- WHEN user types title, then tabs to slug field
- THEN system auto-generates slug from title (lowercase, hyphens)

#### Scenario: TipTap editor minimum content

- GIVEN user is creating a blog post
- WHEN user submits with body < 100 characters
- THEN system shows validation error "Body must be at least 100 characters"

### Requirement: Edit Blog Post

The system SHALL provide an edit page at `/admin/blog-posts/:id` pre-filled with blog post data including TipTap editor content.

#### Scenario: Edit blog post loads data

- GIVEN user navigates to `/admin/blog-posts/:id`
- WHEN page loads
- THEN system fetches post by ID, pre-fills form and TipTap editor

#### Scenario: Update blog post successfully

- GIVEN user is editing a blog post
- WHEN user modifies fields and clicks "Update"
- THEN system calls PUT `/api/blog-posts/:id`, redirects to list

#### Scenario: Update only status

- GIVEN user is on blog post edit page
- WHEN user changes status dropdown and saves
- THEN system calls PUT `/api/blog-posts/:id` with updated status

### Requirement: Delete Blog Post

The system SHALL provide delete functionality with confirmation modal.

#### Scenario: Delete blog post

- GIVEN user is on blog posts list
- WHEN user clicks delete and confirms
- THEN system calls DELETE `/api/blog-posts/:id`, refreshes list

#### Scenario: Restore deleted blog post

- GIVEN user is on blog posts list
- WHEN user clicks "Restore" on a deleted post
- THEN system calls PATCH `/api/blog-posts/:id/restore`, refreshes list
