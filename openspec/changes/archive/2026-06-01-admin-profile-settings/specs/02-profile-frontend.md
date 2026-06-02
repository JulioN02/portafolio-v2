# Profile Settings Frontend — Specification

**Domain**: `admin-profile` · **Change**: `admin-profile-settings` · **Type**: Full spec (new capability)

## Purpose

Define the editable ProfileSettings form in the admin panel, replacing the current read-only display with a functional form connected to the profile API.

---

## Requirements

### Requirement: Editable profile form

The ProfileSettings page MUST render a form with editable fields for `username` and `email`, plus a `currentPassword` field required to save changes.

- **Fields**: `username` (text, pre-filled from auth), `email` (text, pre-filled from API), `currentPassword` (password)
- **Validation**: Username MUST be 3–50 characters; email MUST be a valid email format; currentPassword MUST not be empty
- **Save button**: Disabled while loading; shows loading indicator during API call
- **Success feedback**: Show success notification after save
- **Error feedback**: Show inline error message on failure (e.g., duplicate username, wrong password)

#### Scenario: Load with existing data

- GIVEN the admin user has `{ username: "admin", email: "admin@example.com" }`
- WHEN the ProfileSettings page loads
- THEN the username field shows "admin"
- AND the email field shows "admin@example.com"
- AND the currentPassword field is empty

#### Scenario: Load without email

- GIVEN the admin user has `{ username: "admin" }` and no email set
- WHEN the ProfileSettings page loads
- THEN the email field is empty
- AND the email field does NOT show a placeholder default value

#### Scenario: Successful profile update

- GIVEN the form is filled with `username: "admin2"`, `email: "new@example.com"`, `currentPassword: "correct"`
- WHEN the user clicks Save
- THEN a loading indicator appears on the button
- AND after success, a success notification is shown
- AND the form stays editable for further changes

#### Scenario: Duplicate username error

- GIVEN the form is filled with a username that already exists
- WHEN the user clicks Save
- THEN the server returns 409
- AND the error message "Username already taken" is displayed inline

#### Scenario: Wrong currentPassword

- GIVEN the form is filled with wrong currentPassword
- WHEN the user clicks Save
- THEN the server returns 401
- AND the error message "Current password is incorrect" is displayed inline

#### Scenario: Network error

- GIVEN the API is unreachable
- WHEN the user clicks Save
- THEN a generic error message is shown
- AND the form data is preserved (not cleared)

---

### Requirement: Email field validation

The email field MUST validate on the client side (basic format check) before submitting, but the authoritative validation comes from the Zod schema on the server.

#### Scenario: Invalid email format

- GIVEN the user types "not-an-email" in the email field
- WHEN they click Save
- THEN the form shows a validation error: "Invalid email format"
- AND the form does NOT submit the request

---

### Requirement: i18n translations

All labels, placeholders, errors, and success messages MUST use the i18n system. New keys MUST be added to both ES and EN locale objects.

#### Scenario: Spanish locale

- GIVEN the language is set to Spanish
- WHEN the ProfileSettings page renders
- THEN all visible labels are in Spanish

#### Scenario: English locale

- GIVEN the language is set to English
- WHEN the ProfileSettings page renders
- THEN all visible labels are in English
