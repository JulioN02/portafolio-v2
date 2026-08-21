# Sanitization Specification

## Purpose

Prevent XSS vulnerabilities by ensuring every `dangerouslySetInnerHTML` call passes through `DOMPurify.sanitize()` before rendering user-authored HTML content.

## Requirements

### Requirement: DOMPurify on Every dangerouslySetInnerHTML

Every occurrence of `dangerouslySetInnerHTML` in client-site and recruiter-site MUST use `DOMPurify.sanitize()` on the input value.

#### Scenario: Client-site ServiceDetail sanitizes HTML

- GIVEN the client-site `ServiceDetail.tsx` renders `service.fullDescription` via `dangerouslySetInnerHTML`
- WHEN the component renders
- THEN the value is wrapped in `DOMPurify.sanitize(service.fullDescription)`
- (Previously: raw HTML was passed unsanitized)

#### Scenario: Recruiter-site already uses DOMPurify

- GIVEN the recruiter-site has 3 `dangerouslySetInnerHTML` calls (BlogPostContent body, BlogPostContent lessons, ProjectDetailModal explanation)
- WHEN the proposal verification runs
- THEN all 3 already pass through `DOMPurify.sanitize()`
- AND no changes are needed for recruiter-site

### Requirement: Script Tags Are Stripped

`DOMPurify.sanitize()` MUST strip `<script>`, `<iframe>`, `<object>`, and other dangerous tags from user HTML.

#### Scenario: HTML with script tags is stripped

- GIVEN user HTML containing `<script>alert('xss')</script>`
- WHEN `DOMPurify.sanitize()` processes it
- THEN the output contains no `<script>` tags
- AND safe HTML like `<p>`, `<b>`, `<ul>` remains intact

#### Scenario: HTML with safe tags renders correctly

- GIVEN user HTML with safe tags: `<p>Hello <strong>world</strong></p>`
- WHEN `DOMPurify.sanitize()` processes it
- THEN the output is identical to the input (no safe content lost)

### Requirement: Admin Panel Does Not Render User HTML

The admin-panel renders no `dangerouslySetInnerHTML` because it only edits content (form-based) without rendering it. No sanitization work is needed.

#### Scenario: No dangerouslySetInnerHTML in admin-panel

- GIVEN a grep for `dangerouslySetInnerHTML` in admin-panel source
- WHEN the verification runs
- THEN zero matches are found
- AND no DOMPurify installation is needed
