# Admin Services CRUD Specification

## Purpose

Complete CRUD management for Services entity in admin panel.

## Requirements

### Requirement: List Services

The system SHALL provide a page at `/admin/services` displaying all services in a table with columns: title, category, featured, status, actions. Table MUST support pagination and filtering by category/featured status.

#### Scenario: Services list loads

- GIVEN user is authenticated
- WHEN user navigates to `/admin/services`
- THEN system displays table with all services, pagination (10 per page)

#### Scenario: Filter services by category

- GIVEN user is on services list
- WHEN user selects a category from dropdown
- THEN system filters table to show only that category

#### Scenario: Toggle featured status

- GIVEN user is on services list
- WHEN user clicks featured toggle button
- THEN system updates service featured status via API

### Requirement: Create Service

The system SHALL provide a form page at `/admin/services/new` with fields: title, slug, shortDescription, description, coverImage, category, icon, featured, mediaGallery. Form MUST validate using Zod schema from `@jsoft/shared`.

#### Scenario: Create service successfully

- GIVEN user is on `/admin/services/new`
- WHEN user fills all required fields and clicks "Create"
- THEN system calls POST `/api/services`, redirects to list on success

#### Scenario: Validation error on create

- GIVEN user is on create service page
- WHEN user submits form with invalid data (e.g., title < 3 chars)
- THEN system displays validation errors inline, does NOT submit

### Requirement: Edit Service

The system SHALL provide an edit page at `/admin/services/:id` pre-filled with service data. User MUST be able to update all fields and save changes.

#### Scenario: Edit service loads data

- GIVEN user navigates to `/admin/services/:id`
- WHEN page loads
- THEN system fetches service by ID and pre-fills form

#### Scenario: Update service successfully

- GIVEN user is editing a service
- WHEN user modifies fields and clicks "Update"
- THEN system calls PUT `/api/services/:id`, redirects to list

### Requirement: Delete Service

The system SHALL provide delete functionality in the services list with confirmation modal. Delete MUST call DELETE `/api/services/:id`.

#### Scenario: Delete service with confirmation

- GIVEN user is on services list
- WHEN user clicks delete button on a service
- THEN system shows confirmation modal, on confirm calls DELETE API

#### Scenario: Cancel delete

- GIVEN user clicked delete button
- WHEN user clicks "Cancel" in confirmation modal
- THEN modal closes, NO API call is made
