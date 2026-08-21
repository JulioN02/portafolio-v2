# Admin Success Cases CRUD Specification

## Purpose

Complete CRUD management for SuccessCases entity in admin panel.

## Requirements

### Requirement: List Success Cases

The system SHALL provide a page at `/admin/success-cases` displaying all success cases in a table with columns: title, client, category, featured, actions. Table MUST support pagination.

#### Scenario: Success cases list loads

- GIVEN user is authenticated
- WHEN user navigates to `/admin/success-cases`
- THEN system displays table with all success cases

#### Scenario: Filter by client name

- GIVEN user is on success cases list
- WHEN user types in client filter
- THEN system filters table to matching client names

### Requirement: Create Success Case

The system SHALL provide a form page at `/admin/success-cases/new` with fields: title, slug, client, description, shortDescription, coverImage, category, featured, mediaGallery, testimonial. Form MUST validate using Zod schema.

#### Scenario: Create success case successfully

- GIVEN user is on `/admin/success-cases/new`
- WHEN user fills all required fields and clicks "Create"
- THEN system calls POST `/api/success-cases`, redirects to list

#### Scenario: Testimonial optional

- GIVEN user is creating a success case
- WHEN user submits without testimonial
- THEN system accepts form (testimonial is optional)

### Requirement: Edit Success Case

The system SHALL provide an edit page at `/admin/success-cases/:id` pre-filled with success case data.

#### Scenario: Edit success case loads data

- GIVEN user navigates to `/admin/success-cases/:id`
- WHEN page loads
- THEN system fetches success case by ID and pre-fills form

#### Scenario: Update success case successfully

- GIVEN user is editing a success case
- WHEN user modifies fields and clicks "Update"
- THEN system calls PUT `/api/success-cases/:id`, shows success message

### Requirement: Delete Success Case

The system SHALL provide delete functionality with confirmation modal.

#### Scenario: Delete success case

- GIVEN user is on success cases list
- WHEN user clicks delete and confirms
- THEN system calls DELETE `/api/success-cases/:id`, refreshes list
