# Security Settings Frontend — Specification

**Domain**: `admin-security-password` · **Change**: `admin-profile-settings` · **Type**: Full spec (new capability)

## Purpose

Define the 2-step password change flow in the SecuritySettings page, replacing the current stub form with a proper verification-code-backed flow.

---

## Requirements

### Requirement: 2-step password change flow

The SecuritySettings page MUST implement a 2-step flow:

1. **Step 1 — Credentials**: Admin enters current password + new password + confirm new password, then clicks "Continue".
2. **Step 2 — Verification**: A verification code is sent, admin enters 6-digit code, then clicks "Change Password".

The flow MUST NOT proceed past Step 1 without a successful currentPassword verification on the server.

#### Scenario: Step 1 — Enter credentials

- GIVEN the SecuritySettings page loads
- WHEN the user sees the form
- THEN they see fields for currentPassword, newPassword, and confirmPassword
- AND a "Continue" button (not "Change Password")
- AND the new password fields enforce minimum 6 characters client-side

#### Scenario: Step 1 — New passwords must match

- GIVEN the user typed "pass123" in newPassword and "pass456" in confirmPassword
- WHEN they click Continue
- THEN a client-side error "Passwords do not match" is shown
- AND no API call is made

#### Scenario: Step 1 — Current password verified, transition to Step 2

- GIVEN the user enters currentPassword:"correct", newPassword:"newPass123", confirmPassword:"newPass123"
- WHEN they click Continue
- THEN `POST /auth/verification-code` is called
- AND on success, Step 1 form is hidden
- AND Step 2 (code input) is displayed

#### Scenario: Step 1 — Wrong current password

- GIVEN the user enters a wrong currentPassword
- WHEN they click Continue
- THEN the server returns 401
- AND an error message "Current password is incorrect" is displayed
- AND the user stays on Step 1

---

### Requirement: Step 2 — Code entry UI

After Step 1 succeeds, the UI MUST show:
- A 6-digit numeric input for the verification code
- A message: "A verification code has been sent to your email" (dev: returned on screen)
- A "Change Password" button (disabled while loading)
- A "Resend code" link with 30-second cooldown

#### Scenario: Successful password change

- GIVEN Step 1 completed and the code input is visible
- WHEN the user enters the correct 6-digit code and clicks "Change Password"
- THEN `PATCH /auth/password` is called with `{ code, newPassword }`
- AND on success, a success message is shown
- AND the form resets to Step 1 (initial state)

#### Scenario: Wrong code entered

- GIVEN Step 2 is active
- WHEN the user enters an incorrect code
- THEN an error "Invalid verification code" is shown
- AND the user stays on Step 2 (can retry)

#### Scenario: Expired code

- GIVEN the code expired (older than 10 minutes)
- WHEN the user submits the code
- THEN an error "Code has expired, request a new one" is shown
- AND the UI offers to resend

---

### Requirement: Resend code with cooldown

The SecuritySettings page MUST provide a "Resend code" action after Step 1 passes successfully. The resend button MUST have a 30-second cooldown timer (countdown visible to user).

#### Scenario: Resend code

- GIVEN the user is on Step 2 with code input
- WHEN they click "Resend code"
- THEN `POST /auth/verification-code` is called again
- AND the resend button shows a 30-second countdown (disabled)
- AND after 30 seconds the button becomes clickable again

---

### Requirement: Loading, success, and error states

All interactions MUST provide visual feedback for loading, success, and error states consistent with the admin panel patterns.

#### Scenario: Loading state

- GIVEN the user submitted Step 1 or Step 2
- WHILE the API request is in flight
- THEN the submit button shows a spinner and is disabled
- AND other inputs are disabled

#### Scenario: Success feedback

- GIVEN the password change completed successfully
- WHEN the response returns
- THEN a success notification is shown
- AND after 3 seconds the form resets to Step 1

#### Scenario: Network error

- GIVEN the API is unreachable during any step
- WHEN the request fails
- THEN a generic error message is displayed
- AND the current step's form data is preserved
