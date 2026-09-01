# Upload Hardening Specification

## Purpose

Make file uploads consistent and secure: the server honors the `bucket` parameter, the advertised client accept list matches server capabilities, and served uploads use correct, non-executable content types.

## Requirements

### Requirement: Bucket Parameter Honored Server-Side

The upload endpoint MUST read and validate the `bucket` parameter from the request body against an allowlist of configured buckets (e.g. images, documents, simulators). Uploads MUST be stored in the requested bucket; unknown buckets MUST be rejected with 400.

#### Scenario: Upload to allowed bucket

- GIVEN an authenticated admin
- WHEN an image is uploaded with bucket="images"
- THEN the file is stored in the images bucket

#### Scenario: Unknown bucket rejected

- GIVEN an authenticated admin
- WHEN a file is uploaded with bucket="unknown"
- THEN 400 is returned and no file is stored

#### Scenario: Missing bucket uses default

- GIVEN an authenticated admin
- WHEN a file is uploaded without a bucket parameter
- THEN the upload uses the default bucket (images) or returns 400 per configured policy

### Requirement: Client Accept Matches Server Capabilities

The ImageUploader accept list MUST match the server's allowed extensions. SVG MUST NOT be advertised unless the server explicitly supports it (the server currently rejects SVG for XSS safety).

#### Scenario: Accept list aligned

- GIVEN the admin ImageUploader
- WHEN its accept attribute is inspected
- THEN it contains exactly the types the server accepts (jpg, jpeg, png, webp, gif) and does not advertise SVG

#### Scenario: Server still rejects SVG

- GIVEN a user attempts to upload an .svg file
- WHEN the upload endpoint is called
- THEN 400 is returned with the XSS-safety message

### Requirement: Correct Content-Type on Served Uploads

Files served from upload storage MUST be served with their correct Content-Type and MUST NOT be served as executable or active content (no HTML/SVG-as-HTML).

#### Scenario: Image served with image content-type

- GIVEN a stored PNG
- WHEN its public URL is requested
- THEN the response Content-Type is image/png

#### Scenario: Non-image upload rejected

- GIVEN an .html file
- WHEN the upload endpoint is called
- THEN 400 is returned (only allowed image types are accepted)

## Testing Note

Strict TDD: upload service tests MUST cover bucket validation, accept-list alignment, and content-type serving (api package, 70% coverage).

## Risks

- Client/server accept mismatch causes confusing UX errors (low); aligned by this spec.
- Bucket allowlist must be config-driven to avoid redeploys when adding buckets (medium).