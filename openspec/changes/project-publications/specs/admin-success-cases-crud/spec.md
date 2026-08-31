# Delta for Admin Success Cases CRUD

## MODIFIED Requirements

### Requirement: Create Success Case

The system SHALL provide a form page at `/admin/success-cases/new` with fields: title, slug, client, description, shortDescription, coverImage, category, featured, mediaGallery, testimonial, videos, and links. Form MUST validate using Zod schema.
(Previously: videos and links fields were absent from the form)

#### Scenario: Create success case successfully

- GIVEN user is on `/admin/success-cases/new`
- WHEN user fills all required fields and clicks "Create"
- THEN system calls POST `/api/success-cases`, redirects to list

#### Scenario: Testimonial optional

- GIVEN user is creating a success case
- WHEN user submits without testimonial
- THEN system accepts form (testimonial is optional)

#### Scenario: Add videos and links

- GIVEN user is on the create form
- WHEN user adds video URLs and link URLs
- THEN the POST payload includes videos and links arrays

### Requirement: Edit Success Case

The system SHALL provide an edit page at `/admin/success-cases/:id` pre-filled with success case data, including videos and links, which MUST be editable and saved on update.
(Previously: videos and links were not editable in the edit form)

#### Scenario: Edit success case loads data

- GIVEN user navigates to `/admin/success-cases/:id`
- WHEN page loads
- THEN system fetches success case by ID and pre-fills form including videos and links

#### Scenario: Update success case successfully

- GIVEN user is editing a success case
- WHEN user modifies fields (including videos/links) and clicks "Update"
- THEN system calls PUT `/api/success-cases/:id`, shows success message

## Testing Note

Frontend form behavior (no api test impact); shared successCase Zod schema already supports videos and links.