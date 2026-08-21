# Admin Tools CRUD Specification

## Purpose

Complete CRUD management for Tools entity in admin panel.

## Requirements

### Requirement: List Tools

The system SHALL provide a page at `/admin/tools` displaying all tools in a table with columns: name, category, featured, actions. Table MUST support pagination.

#### Scenario: Tools list loads

- GIVEN user is authenticated
- WHEN user navigates to `/admin/tools`
- THEN system displays table with all tools, pagination controls

#### Scenario: Reorder tools

- GIVEN user is on tools list
- WHEN user drags a tool to new position
- THEN system calls PATCH `/api/tools/:id/reorder` with new order

### Requirement: Create Tool

The system SHALL provide a form page at `/admin/tools/new` with fields: name, slug, description, shortDescription, coverImage, category, featured, mediaGallery, link. Form MUST validate using Zod schema.

#### Scenario: Create tool successfully

- GIVEN user is on `/admin/tools/new`
- WHEN user fills all required fields and clicks "Create"
- THEN system calls POST `/api/tools`, redirects to list

#### Scenario: Link validation optional

- GIVEN user is creating a tool
- WHEN user leaves link field empty
- THEN system accepts form (link is optional)

### Requirement: Edit Tool

The system SHALL provide an edit page at `/admin/tools/:id` pre-filled with tool data.

#### Scenario: Edit tool loads data

- GIVEN user navigates to `/admin/tools/:id`
- WHEN page loads
- THEN system fetches tool by ID and pre-fills form

#### Scenario: Update tool successfully

- GIVEN user is editing a tool
- WHEN user modifies fields and clicks "Update"
- THEN system calls PUT `/api/tools/:id`, redirects to list

### Requirement: Delete Tool

The system SHALL provide delete functionality with confirmation modal.

#### Scenario: Delete tool

- GIVEN user is on tools list
- WHEN user clicks delete and confirms
- THEN system calls DELETE `/api/tools/:id`, removes from list
