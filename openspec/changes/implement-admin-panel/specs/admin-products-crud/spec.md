# Admin Products CRUD Specification

## Purpose

Complete CRUD management for Products entity in admin panel.

## Requirements

### Requirement: List Products

The system SHALL provide a page at `/admin/products` displaying all products in a table with columns: name, category, price, featured, status, actions. Table MUST support pagination and filtering.

#### Scenario: Products list loads

- GIVEN user is authenticated
- WHEN user navigates to `/admin/products`
- THEN system displays table with all products using TanStack Query

#### Scenario: Filter products by price range

- GIVEN user is on products list
- WHEN user enters min/max price filter
- THEN system filters table to matching products

### Requirement: Create Product

The system SHALL provide a form page at `/admin/products/new` with fields: name, slug, description, shortDescription, coverImage, price, category, featured, mediaGallery. Form MUST validate using Zod schema.

#### Scenario: Create product successfully

- GIVEN user is on `/admin/products/new`
- WHEN user fills all required fields and clicks "Create"
- THEN system calls POST `/api/products`, redirects to list

#### Scenario: Price validation

- GIVEN user is creating a product
- WHEN user enters negative price
- THEN system shows validation error "Price must be positive"

### Requirement: Edit Product

The system SHALL provide an edit page at `/admin/products/:id` pre-filled with product data.

#### Scenario: Edit product loads data

- GIVEN user navigates to `/admin/products/:id`
- WHEN page loads
- THEN system fetches product by ID and pre-fills form

#### Scenario: Update product successfully

- GIVEN user is editing a product
- WHEN user modifies fields and clicks "Update"
- THEN system calls PUT `/api/products/:id`, shows success message

### Requirement: Delete Product

The system SHALL provide delete functionality with confirmation modal.

#### Scenario: Delete product

- GIVEN user is on products list
- WHEN user clicks delete and confirms
- THEN system calls DELETE `/api/products/:id`, refreshes list
