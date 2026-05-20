# Recruiter Blog Specification

## Purpose

Published blog posts grid and individual post detail pages.

## Requirements

### Requirement: Blog Grid

The system SHALL fetch `GET /api/blog-posts?status=PUBLISHED` and display a 3-column grid with title, excerpt, coverImage, category, and date.

#### Scenario: Render published grid

- GIVEN user visits `/blog`
- WHEN posts load
- THEN grid displays published posts in 3-column layout

#### Scenario: Empty grid

- GIVEN API returns empty array
- WHEN blog page renders
- THEN grid shows "No posts published yet" empty state

### Requirement: Blog Post Page

The system SHALL render an individual post at `/blog/:slug` with full body (sanitized via DOMPurify), coverImage, category, externalLink, and lessonsLearned.

#### Scenario: Render post detail

- GIVEN user clicks a blog post card
- WHEN navigating to `/blog/:slug`
- THEN post renders with all fields and externalLink opens in new tab

#### Scenario: Post not found

- GIVEN slug does not match any post
- WHEN user navigates to `/blog/:slug`
- THEN system displays 404 page
