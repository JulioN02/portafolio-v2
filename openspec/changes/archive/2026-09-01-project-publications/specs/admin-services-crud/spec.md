# Delta for Admin Services CRUD

## MODIFIED Requirements

### Requirement: Create Service

The system SHALL provide a form page at `/admin/services/new` with fields: title, slug, shortDescription, description, coverImage, category, icon, featured, mediaGallery, includedItems, and technicalExplanation. Form MUST validate using Zod schema from `@jsoft/shared`.
(Previously: includedItems and technicalExplanation fields were absent from the form)

#### Scenario: Create service successfully

- GIVEN user is on `/admin/services/new`
- WHEN user fills all required fields and clicks "Create"
- THEN system calls POST `/api/services`, redirects to list on success

#### Scenario: Validation error on create

- GIVEN user is on create service page
- WHEN user submits form with invalid data (e.g., title < 3 chars, or no includedItems)
- THEN system displays validation errors inline, does NOT submit

#### Scenario: Add includedItems and technicalExplanation

- GIVEN user is on the create form
- WHEN user adds included items and a technical explanation
- THEN the POST payload includes includedItems array and technicalExplanation

### Requirement: Edit Service

The system SHALL provide an edit page at `/admin/services/:id` pre-filled with service data, including includedItems and technicalExplanation, which MUST be editable and saved on update.
(Previously: includedItems and technicalExplanation were not editable)

#### Scenario: Edit service loads data

- GIVEN user navigates to `/admin/services/:id`
- WHEN page loads
- THEN system fetches service by ID and pre-fills form including includedItems and technicalExplanation

#### Scenario: Update service successfully

- GIVEN user is editing a service
- WHEN user modifies fields (including includedItems/technicalExplanation) and clicks "Update"
- THEN system calls PUT `/api/services/:id`, redirects to list

## Testing Note

Frontend form behavior (no api test impact); shared service Zod schema already supports includedItems (required, min 1) and technicalExplanation (optional).