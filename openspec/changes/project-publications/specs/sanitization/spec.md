# Delta for Sanitization

## MODIFIED Requirements

### Requirement: DOMPurify on Every dangerouslySetInnerHTML

Every occurrence of `dangerouslySetInnerHTML` in client-site, recruiter-site, and admin-panel MUST use `DOMPurify.sanitize()` on the input value. The DOMPurify configuration MUST use a media allowlist that preserves inline rich-text nodes — `img`, `video`, `source`, `figure`, `figcaption`, and `iframe` ONLY when the src points to the dedicated simulator serving endpoint. All other dangerous tags MUST remain stripped.
(Previously: default DOMPurify config stripped iframes and media nodes; simulator iframes were not contemplated)

#### Scenario: Client-site ServiceDetail sanitizes HTML

- GIVEN the client-site `ServiceDetail.tsx` renders `service.fullDescription` via `dangerouslySetInnerHTML`
- WHEN the component renders
- THEN the value is wrapped in `DOMPurify.sanitize(service.fullDescription, { mediaAllowlist })`

#### Scenario: Recruiter-site already uses DOMPurify

- GIVEN the recruiter-site has 3 `dangerouslySetInnerHTML` calls (BlogPostContent body, BlogPostContent lessons, ProjectDetailModal explanation)
- WHEN the proposal verification runs
- THEN all 3 already pass through `DOMPurify.sanitize()`
- AND they use the media allowlist

#### Scenario: Inline image preserved

- GIVEN rich content containing `<figure><img src="/uploads/x.png"></figure>`
- WHEN DOMPurify sanitizes with the media allowlist
- THEN the figure and img nodes are preserved

#### Scenario: Simulator iframe restricted to dedicated endpoint

- GIVEN rich content containing an iframe pointing to `/api/simulators/:id/content`
- WHEN DOMPurify sanitizes with the media allowlist
- THEN the iframe is preserved
- AND an iframe pointing to any other origin is stripped

### Requirement: Script Tags Are Stripped

`DOMPurify.sanitize()` MUST strip `<script>`, `<object>`, and other dangerous tags from user HTML. Simulator HTML is the sole exception: it is NEVER passed through DOMPurify and is only rendered inside the sandboxed iframe served by the dedicated endpoint.
(Previously: no exception existed; all iframes stripped)

#### Scenario: HTML with script tags is stripped

- GIVEN user HTML containing `<script>alert('xss')</script>`
- WHEN `DOMPurify.sanitize()` processes it
- THEN the output contains no `<script>` tags
- AND safe HTML like `<p>`, `<b>`, `<ul>` remains intact

#### Scenario: HTML with safe tags renders correctly

- GIVEN user HTML with safe tags: `<p>Hello <strong>world</strong></p>`
- WHEN `DOMPurify.sanitize()` processes it
- THEN the output is identical to the input (no safe content lost)

#### Scenario: Simulator bypasses DOMPurify by design

- GIVEN a simulator with arbitrary HTML/CSS/JS
- WHEN it renders
- THEN it renders only via the sandboxed iframe (never through DOMPurify or dangerouslySetInnerHTML)

### Requirement: Admin Panel Does Not Render User HTML

The admin-panel renders no `dangerouslySetInnerHTML` because it only edits content (form-based) without rendering it. No sanitization work is needed.

#### Scenario: No dangerouslySetInnerHTML in admin-panel

- GIVEN a grep for `dangerouslySetInnerHTML` in admin-panel source
- WHEN the verification runs
- THEN zero matches are found
- AND no DOMPurify installation is needed

## Testing Note

Sanitization is verified by render-time assertions (DOMPurify output) rather than api unit tests; the media allowlist MUST be asserted for strip/preserve behavior in the verify phase.

## Risks

- Overly permissive allowlist would reintroduce XSS (medium); iframe src MUST be restricted to the simulator endpoint.