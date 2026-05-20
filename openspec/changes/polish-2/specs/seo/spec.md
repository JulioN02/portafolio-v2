# SEO Specification

## Purpose

Ensure each route in client-site and recruiter-site has unique, semantically correct meta tags (title, description, Open Graph, Twitter Card, canonical URL) for search engine visibility and social sharing.

## Requirements

### Requirement: Per-Route Meta Tags

Every page route in client-site and recruiter-site MUST output unique `<title>` and `<meta name="description">` in the `<head>` via `react-helmet-async`.

#### Scenario: Home page has correct OG tags

- GIVEN a user navigates to the client-site home page
- WHEN the page renders
- THEN the `<head>` contains `<meta property="og:title">` matching the page title
- AND `<meta property="og:description">` matches the page description
- AND `<meta property="og:type">` is set to `"website"`

#### Scenario: Blog post page has article meta

- GIVEN a user navigates to a recruiter-site blog post at `/blog/:slug`
- WHEN the page renders
- THEN the `<head>` contains `<meta property="article:published_time">` matching the post's `createdAt`
- AND `<meta property="og:type">` is set to `"article"`

#### Scenario: Route without explicit title falls back to site name

- GIVEN a route that has no explicit meta tag configuration
- WHEN the page renders
- THEN the title defaults to the site name (e.g. "JSoft Soluciones")

### Requirement: Canonical URLs

Every page route in client-site and recruiter-site SHOULD include a `<link rel="canonical">` pointing to the canonical URL of the current page.

#### Scenario: Canonical URL matches current path

- GIVEN a user visits `/servicios/desarrollo-web`
- WHEN the page renders
- THEN `<link rel="canonical" href="https://jsoftsoluciones.com/servicios/desarrollo-web">` is present

#### Scenario: Canonical URL for home page

- GIVEN a user visits `/`
- WHEN the page renders
- THEN `<link rel="canonical" href="https://jsoftsoluciones.com">` is present

### Requirement: Twitter Card Tags

Every page route in client-site and recruiter-site SHOULD include `<meta name="twitter:card">` and `<meta name="twitter:title">`.

#### Scenario: Twitter card renders on sharing

- GIVEN a user shares a page on Twitter
- WHEN the meta tags are scraped
- THEN `<meta name="twitter:card" content="summary_large_image">` is present
- AND `<meta name="twitter:title">` matches the page title

### Requirement: NotFound Page Meta

The 404/NotFound page MUST have distinct meta tags indicating the page was not found.

#### Scenario: NotFound page meta

- GIVEN a user lands on a non-existent route
- WHEN the NotFound page renders
- THEN the title is "404 - Página no encontrada | JSoft Soluciones"
- AND `<meta name="robots" content="noindex">` is present
