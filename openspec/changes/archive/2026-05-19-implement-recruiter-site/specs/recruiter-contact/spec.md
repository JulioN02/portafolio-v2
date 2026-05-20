# Recruiter Contact Specification

## Purpose

Recruiter contact form validated with the shared schema and social links display.

## Requirements

### Requirement: Contact Form

The system SHALL render a contact form at `/contacto` validated with `recruiterContactSchema` from `@jsoft/shared`. On valid submission, it SHALL POST `{...formData, originType: "RECRUITER"}` to `/api/contact`.

#### Scenario: Successful submission

- GIVEN user is on `/contacto`
- WHEN user fills valid data and submits
- THEN POST is sent with `originType: "RECRUITER"` and success message is displayed

#### Scenario: Validation errors

- GIVEN user is on `/contacto`
- WHEN user submits with invalid data (missing required field, invalid email)
- THEN field-level errors are shown and no API call is made

#### Scenario: API error

- GIVEN user submits valid data
- WHEN API returns 4xx or 5xx error
- THEN form stays filled and generic error message is displayed

### Requirement: Social Links

The system SHALL display clickable social links for WhatsApp, LinkedIn, GitHub, and email on the contact page.

#### Scenario: Render social links

- GIVEN user is on `/contacto`
- WHEN social links section renders
- THEN icons for WhatsApp, LinkedIn, GitHub, and email are displayed with href targets
