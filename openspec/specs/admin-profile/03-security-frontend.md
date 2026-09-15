# Security Settings Frontend — Specification

**Domain**: `admin-security-password` · **Change**: `admin-profile-settings` · **Type**: Full spec (new capability)

## Purpose

Define the single-step password change flow and TOTP 2FA management (enable/disable, recovery codes) in the SecuritySettings page.

---

## Requirements

### Requirement: Single-step password change flow

The SecuritySettings page MUST render a single form with `currentPassword`, `newPassword`, `confirmPassword`, and — when `twoFactorEnabled = true` — a TOTP code input plus an alternative recovery-code input. Submitting MUST call `PATCH /auth/password` with `{ currentPassword, totpCode?, recoveryCode?, newPassword }`. `newPassword` MUST be at least 12 characters client-side. Password/confirm mismatch MUST show a client-side error without an API call. A `403` from wrong `currentPassword` MUST display "Current password is incorrect" and preserve form data.

#### Scenario: Single form rendered

- GIVEN the SecuritySettings page loads
- WHEN the user sees the form
- THEN it shows currentPassword, newPassword, confirmPassword in one step
- AND no intermediate code screen appears

#### Scenario: New passwords must match

- GIVEN `newPassword` and `confirmPassword` differ
- WHEN the user submits
- THEN a client-side "Passwords do not match" error is shown
- AND no API call is made

#### Scenario: Password too short client-side

- GIVEN a `newPassword` of 11 characters
- WHEN the user submits
- THEN a client-side validation error is shown
- AND no API call is made

#### Scenario: Success, 2FA disabled

- GIVEN `twoFactorEnabled = false` and correct `currentPassword`
- WHEN the user submits the form
- THEN `PATCH /auth/password` succeeds, a success message is shown
- AND the form resets to initial state

#### Scenario: 2FA enabled, TOTP fields shown

- GIVEN `twoFactorEnabled = true`
- WHEN the user sees the form
- THEN TOTP and recovery-code inputs are visible

#### Scenario: Success, 2FA enabled via TOTP

- GIVEN `twoFactorEnabled = true`
- WHEN the user submits with a valid TOTP code
- THEN `PATCH /auth/password` succeeds and a success message is shown

#### Scenario: Wrong current password

- GIVEN the user enters a wrong `currentPassword`
- WHEN they submit
- THEN the server returns `403`
- AND "Current password is incorrect" is displayed
- AND form data is preserved

---

### Requirement: 2FA enable flow UI

The SecuritySettings page MUST show an enable section when `twoFactorEnabled = false`: "Enable 2FA" MUST call `POST /auth/2fa/setup`, display the QR image and `otpauthUrl`/secret with instructions, then collect a 6-digit TOTP code and call `POST /auth/2fa/enable`. On success it MUST display the 10 recovery codes once. Cancelling the flow MUST NOT change `twoFactorEnabled`.

#### Scenario: Enable happy path

- GIVEN `twoFactorEnabled = false`
- WHEN the user enables 2FA and enters a valid code
- THEN 2FA becomes enabled and 10 recovery codes are displayed with a warning

#### Scenario: Wrong code during enable

- GIVEN the enable flow is active
- WHEN the user enters an invalid TOTP code
- THEN an error is shown and the user stays on the enable step

#### Scenario: Cancel enable

- GIVEN the enable flow is active
- WHEN the user cancels
- THEN `twoFactorEnabled` remains `false` and the UI returns to the disabled state

---

### Requirement: Recovery codes display once

After a successful enable, the system MUST show all 10 codes (`XXXX-XXXX`) exactly once with a warning to store them securely, and MUST NOT allow re-display from the UI or any API.

#### Scenario: Codes cannot be re-displayed

- GIVEN the recovery codes were shown at enable
- WHEN the user dismisses the codes and revisits settings
- THEN no UI or API offers the codes again

---

### Requirement: 2FA disable flow UI

The SecuritySettings page MUST show a disable section when `twoFactorEnabled = true`, collecting `currentPassword` and a TOTP code and calling `POST /auth/2fa/disable`. A `403` (wrong password) or `400` (wrong code) MUST be displayed inline.

#### Scenario: Disable happy path

- GIVEN `twoFactorEnabled = true`
- WHEN the user enters correct password and TOTP and confirms
- THEN 2FA is disabled and the UI shows the enable section

#### Scenario: Wrong TOTP during disable

- GIVEN the disable section is active
- WHEN the user enters an invalid TOTP code
- THEN an error is shown and 2FA remains enabled

---

### Requirement: 2FA status display

The SecuritySettings page MUST reflect `twoFactorEnabled` from `GET /auth/me`: show the enable section when `false`, the disable section when `true`.

#### Scenario: Status follows backend

- GIVEN the backend reports `twoFactorEnabled: true`
- WHEN the page loads
- THEN the disable section is shown and no enable section appears

---

### Requirement: i18n ES/EN

All new user-facing strings (2FA enable/disable, recovery-codes warning, TOTP/recovery inputs, related errors) MUST have both ES and EN translations in `i18n/translations.ts` and MUST switch with the existing locale mechanism. No hardcoded user-facing strings.

#### Scenario: Language switch

- GIVEN the UI language is ES
- WHEN the user switches to EN
- THEN all 2FA labels render in English
- AND switching back to ES renders them in Spanish

---

### Requirement: Loading, success, and error states

All interactions MUST provide visual feedback for loading, success, and error states consistent with the admin panel patterns.

#### Scenario: Loading state

- GIVEN the user submitted the password form or a 2FA action
- WHILE the API request is in flight
- THEN the submit button shows a spinner and is disabled
- AND other inputs are disabled

#### Scenario: Success feedback

- GIVEN the password change completed successfully
- WHEN the response returns
- THEN a success notification is shown
- AND after 3 seconds the form resets to its initial state

#### Scenario: Network error

- GIVEN the API is unreachable during any step
- WHEN the request fails
- THEN a generic error message is displayed
- AND the current form data is preserved