# Delta for Blog Post API

## MODIFIED Requirements

### Requirement: Blog Post API Routes

The system SHALL provide the following API routes for BlogPost entity under `/api/blog-posts`. Public routes MUST be accessible without auth. Protected routes MUST require JWT authentication via authMiddleware.

(Previously: Only GET routes existed for public consumption)

#### Scenario: Get all blog posts (public, with filters)

- GIVEN API server is running
- WHEN GET `/api/blog-posts` is called with optional query params (status, category, page, limit)
- THEN system returns paginated list of posts matching filters

#### Scenario: Get blog post by slug (public)

- GIVEN API server is running
- WHEN GET `/api/blog-posts/:slug` is called with valid slug
- THEN system returns blog post data

#### Scenario: Get blog post by ID (protected, for admin)

- GIVEN user has valid JWT
- WHEN GET `/api/blog-posts/by-id/:id` is called with valid ID
- THEN system returns blog post data for editing

#### Scenario: Create blog post (protected)

- GIVEN user has valid JWT
- WHEN POST `/api/blog-posts` is called with valid blog post data
- THEN system creates post, returns 201 with created post

#### Scenario: Update blog post (protected)

- GIVEN user has valid JWT
- WHEN PUT `/api/blog-posts/:id` is called with valid update data
- THEN system updates post, returns updated post

#### Scenario: Delete blog post (protected)

- GIVEN user has valid JWT
- WHEN DELETE `/api/blog-posts/:id` is called
- THEN system soft-deletes post, returns success message

#### Scenario: Restore blog post (protected)

- GIVEN user has valid JWT
- WHEN PATCH `/api/blog-posts/:id/restore` is called
- THEN system restores soft-deleted post, returns restored post

#### Scenario: Reorder blog posts (protected)

- GIVEN user has valid JWT
- WHEN PATCH `/api/blog-posts/:id/reorder` is called with new order
- THEN system updates post order, returns success

#### Scenario: Change post status (protected)

- GIVEN user has valid JWT
- WHEN PATCH `/api/blog-posts/:id/status` is called with new status
- THEN system updates post status, returns updated post

#### Scenario: Unauthorized access to protected route

- GIVEN user does NOT have valid JWT
- WHEN POST `/api/blog-posts` is called
- THEN system returns 401 Unauthorized
