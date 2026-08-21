# Admin Contact Forms Specification

## Purpose

Read-only list of contact form submissions received from the public portfolio site.

## Requirements

### Requirement: List Contact Forms

The system SHALL provide a page at `/admin/contact-forms` displaying all contact form submissions in a table with columns: name, email, subject, message (truncated), created date. Table MUST support pagination and allow viewing full message details.

#### Scenario: Contact forms list loads

- GIVEN user is authenticated
- WHEN user navigates to `/admin/contact-forms`
- THEN system displays table with all submissions, pagination (10 per page)

#### Scenario: View full message

- GIVEN user is on contact forms list
- WHEN user clicks on a row to expand
- THEN system shows full message in expanded row or modal

#### Scenario: Filter by date range

- GIVEN user is on contact forms list
- WHEN user selects date range filter
- THEN system filters to submissions within that range

### Requirement: No Edit/Delete for Contact Forms

The system SHALL NOT provide edit or delete functionality for contact forms. Contact form submissions MUST be read-only.

#### Scenario: No edit button present

- GIVEN user is on contact forms list
- WHEN page loads
- THEN table shows only view details, NO edit/delete buttons

#### Scenario: Direct URL access to edit prevented

- GIVEN user is authenticated
- WHEN user navigates to `/admin/contact-forms/:id/edit`
- THEN system shows 404 or redirects to list (route does not exist)
