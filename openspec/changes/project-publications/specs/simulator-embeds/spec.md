# Simulator Embeds Specification

## Purpose

Per-publication HTML/CSS/JS simulators stored as files in the dedicated `simulators` Supabase bucket, inserted inline in rich content ("Insertar simulador" node) or as a standalone section, and rendered in a sandboxed iframe served by a dedicated API endpoint with strict XSS containment.

## Requirements

### Requirement: Simulator File Upload

The admin SHALL upload simulator files (HTML with embedded CSS/JS) to the `simulators` bucket via a protected endpoint. Upload MUST enforce a size limit (max 1MB per file) and restrict content to HTML text.

#### Scenario: Upload simulator

- GIVEN an authenticated admin
- WHEN a simulator HTML file is uploaded to the simulators bucket
- THEN the file is stored and a simulator record (id, title, file url, size) is created

#### Scenario: Oversized file rejected

- GIVEN a file larger than the size limit
- WHEN the admin uploads it
- THEN the upload is rejected with 400

#### Scenario: Unauthenticated upload rejected

- GIVEN no valid JWT
- WHEN a simulator is uploaded
- THEN 401 is returned

### Requirement: Dedicated Serving Endpoint

Simulator files MUST be served by a dedicated API endpoint (e.g. GET `/api/simulators/:id/content`) responding with `Content-Type: text/html`, CSP `sandbox` headers (no same-origin privileges), and no-cache.

#### Scenario: Endpoint serves sandboxed HTML

- GIVEN a stored simulator
- WHEN GET `/api/simulators/:id/content` is requested
- THEN the raw HTML is returned with text/html content-type and CSP sandbox headers

#### Scenario: Unknown simulator

- GIVEN an invalid id
- WHEN the endpoint is requested
- THEN 404 is returned

### Requirement: Sandboxed Iframe Rendering

Simulators MUST render inside an iframe with `sandbox="allow-scripts"` and WITHOUT `allow-same-origin`. The iframe MUST load from the dedicated endpoint (never inline raw HTML into the parent document, never via DOMPurify). Parent origin access, cookies, and localStorage MUST be unavailable to the iframe.

#### Scenario: Sandbox attributes present

- GIVEN a rendered simulator
- WHEN the iframe DOM is inspected
- THEN it has sandbox="allow-scripts" and no allow-same-origin

#### Scenario: Script runs but parent isolated

- GIVEN a simulator containing a script that tries to read parent DOM or storage
- WHEN the iframe executes it
- THEN the script runs inside the iframe but cannot access parent origin, cookies, or storage

#### Scenario: Malicious content contained

- GIVEN a simulator containing `<script>alert(document.cookie)</script>`
- WHEN the iframe loads
- THEN the script cannot exfiltrate parent cookies

### Requirement: Inline and Standalone Placement

Simulators MUST be insertable as an inline block between paragraphs in rich content (editor node "Insertar simulador") AND as a standalone section on a page. Rendering MUST use the sandboxed iframe in both placements.

#### Scenario: Inline simulator renders

- GIVEN rich content with a simulator node between two paragraphs
- WHEN the content is rendered
- THEN a sandboxed iframe appears between the paragraphs

#### Scenario: Standalone simulator renders

- GIVEN a page with a standalone simulator section
- WHEN the page renders
- THEN the sandboxed iframe renders with constrained dimensions per configured limits

### Requirement: Size and Dimension Limits

Simulator rendering MUST enforce dimension limits (max width/height) and the serving endpoint MUST reject content exceeding configured limits.

#### Scenario: Oversized content blocked

- GIVEN a simulator whose content exceeds configured limits
- WHEN the serving endpoint is requested
- THEN the request is rejected

## Testing Note

Strict TDD: simulator service tests MUST cover upload validation (size, type, auth), record creation, and endpoint header/404 behavior (api package, 70% coverage). Iframe/XSS containment is verified via sandbox attribute and CSP assertions during verify.

## Risks

- XSS via simulators is the highest risk (high): mitigated by `sandbox="allow-scripts"` without `allow-same-origin`, CSP headers, size limits, and no DOMPurify rendering of raw simulator HTML.
- Iframe content is NOT sanitized by design — containment relies entirely on the sandbox.