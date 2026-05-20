# Lazy Loading Specification

## Purpose

Reduce initial bundle size and improve perceived performance by lazy-loading below-fold images and heavy page components across all 3 frontends.

## Requirements

### Requirement: Below-Fold Image Lazy Loading

All `<img>` elements positioned below the visible viewport on initial page load MUST include `loading="lazy"`.

#### Scenario: Admin-panel images get lazy loading

- GIVEN the admin-panel renders image thumbnails in blog post list, product form, and success case form
- WHEN those images are below the fold
- THEN each `<img>` has `loading="lazy"` attribute
- AND images above the fold remain `loading="eager"`

#### Scenario: Image already in viewport loads eagerly

- GIVEN a hero image rendered above the fold
- WHEN the page loads
- THEN the image does NOT have `loading="lazy"`
- AND it loads immediately

### Requirement: Heavy Component Lazy Loading

Page components with heavy rendering or large dependencies MUST use `React.lazy()` wrapped in `<Suspense>`.

#### Scenario: Blog post content lazy loads

- GIVEN the recruiter-site BlogPostPage renders HTML content with DOMPurify
- WHEN the page loads
- THEN the content component is wrapped in `React.lazy()` + `<Suspense>`
- AND a skeleton/placeholder shows while loading

#### Scenario: Admin CRUD form pages lazy load

- GIVEN the admin-panel has create/edit forms for services, products, tools, and success cases
- WHEN navigating to a form route
- THEN each form page is wrapped in `React.lazy()` + `<Suspense>`
- AND the Suspense fallback has matching layout dimensions

### Requirement: Suspense Fallback Dimensions

Every `<Suspense>` fallback MUST match the expected layout dimensions to prevent Cumulative Layout Shift (CLS).

#### Scenario: Fallback skeleton prevents layout shift

- GIVEN a lazy-loaded component with dimensions 800x400
- WHEN the fallback renders
- THEN the fallback element is 800x400 (or proportional)
- AND the final component occupies the same space

#### Scenario: Slow network shows skeleton

- GIVEN a user on a slow 3G network
- WHEN they navigate to a lazy-loaded route
- THEN a skeleton placeholder is visible immediately
- AND the full content appears without shifting layout once loaded
