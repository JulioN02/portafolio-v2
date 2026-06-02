# Admin Profile API — Specification

**Domain**: `admin-profile` · **Change**: `admin-profile-settings` · **Type**: Full spec (new capability)

## Purpose

Define the API contract for authenticated admin profile management: updating profile fields (username/email), generating verification codes, and changing passwords.

---

## Requirements

### Requirement: Profile Update — `PATCH /auth/profile`

Updates the authenticated user's username and/or email. Both fields are optional in the request, but at least one MUST be provided. `currentPassword` MUST be provided and valid.

- **Method**: `PATCH`
- **Auth**: `authMiddleware` (JWT required)
- **Body**: `{ username?: string, email?: string, currentPassword: string }`

The system MUST reject the request with `400` if:
- Neither `username` nor `email` is provided.
- `currentPassword` is missing or empty.

The system MUST reject with `401` if `currentPassword` does not match the stored hash.

The system MUST reject with `409` if the new `username` (or `email`) is already taken by another user.

On success (`200`), the system MUST return the updated user object: `{ id, username, email?, role }`.

#### Scenario: Update username only

- GIVEN an authenticated admin user with username "admin"
- WHEN they send `PATCH /auth/profile` with `{ username: "admin2", currentPassword: "correct" }`
- THEN the response status is `200`
- AND the body contains `{ username: "admin2" }`

#### Scenario: Update email only

- GIVEN an authenticated admin user
- WHEN they send `PATCH /auth/profile` with `{ email: "new@example.com", currentPassword: "correct" }`
- THEN the response status is `200`
- AND the body contains `{ email: "new@example.com" }`

#### Scenario: Wrong currentPassword

- GIVEN an authenticated admin user
- WHEN they send `PATCH /auth/profile` with `{ username: "hacker", currentPassword: "wrong" }`
- THEN the response status is `401`
- AND the body contains an error message

#### Scenario: Duplicate username

- GIVEN another user with username "existing" exists
- WHEN the admin sends `PATCH /auth/profile` with `{ username: "existing", currentPassword: "correct" }`
- THEN the response status is `409`

#### Scenario: Missing currentPassword

- GIVEN an authenticated admin user
- WHEN they send `PATCH /auth/profile` with `{ username: "new" }` (no currentPassword)
- THEN the response status is `400`
- AND the body contains a validation error for `currentPassword`

---

### Requirement: Request Verification Code — `POST /auth/verification-code`

Generates a 6-digit numeric verification code, stores it in-memory with a 10-minute TTL, and returns it (dev mode only — in production this would be emailed).

- **Method**: `POST`
- **Auth**: `authMiddleware` (JWT required)
- **Body**: none required (empty body or `{}`)
- **Response**: `{ code: "123456", expiresIn: 600 }`

The system MUST generate a 6-digit numeric code (000000–999999).
The system MUST store the code associated with the user's ID in an in-memory `Map`.
The system MUST set a TTL of 600 seconds (10 minutes) per code.
The system MUST return the code in the response body in dev environments.
The system MUST overwrite any previous unexpired code for the same user.

#### Scenario: Generate code successfully (dev mode)

- GIVEN an authenticated admin user with a known email
- WHEN they send `POST /auth/verification-code`
- THEN the response status is `200`
- AND the body contains `{ code: <6-digit-string>, expiresIn: 600 }`
- AND `<6-digit-string>` matches `/^\d{6}$/`

#### Scenario: Regenerate overwrites previous code

- GIVEN the user has an active verification code "123456"
- WHEN they send `POST /auth/verification-code` again
- THEN the new code replaces "123456" in memory
- AND the old code becomes invalid

---

### Requirement: Change Password — `PATCH /auth/password`

Changes the user's password after verifying a valid verification code.

- **Method**: `PATCH`
- **Auth**: `authMiddleware` (JWT required)
- **Body**: `{ code: string, newPassword: string }`
- **Validation**: `newPassword` MUST be at least 6 characters

The system MUST reject with `400` if `code` is missing, malformed, or expired (TTL exceeded).
The system MUST reject with `400` if `newPassword` is less than 6 characters.
The system MUST reject with `400` if `code` does not match the stored code for this user.
The system MUST delete the code after successful verification (single-use).
The system MUST hash the new password with bcrypt before storing.
The system MUST NOT invalidate existing JWT sessions (current session remains active).
On success (`200`), the system MUST return `{ message: "Password updated successfully" }`.

#### Scenario: Successful password change

- GIVEN the user has a valid verification code "654321" for their account
- WHEN they send `PATCH /auth/password` with `{ code: "654321", newPassword: "newPass123" }`
- THEN the response status is `200`
- AND the response body indicates success
- AND the code "654321" is removed from memory (single-use)

#### Scenario: Wrong verification code

- GIVEN the user has a valid verification code "654321"
- WHEN they send `PATCH /auth/password` with `{ code: "000000", newPassword: "newPass123" }`
- THEN the response status is `400`
- AND the body contains an error message about invalid code

#### Scenario: Expired code

- GIVEN the verification code was generated more than 10 minutes ago
- WHEN the user sends `PATCH /auth/password` with that code
- THEN the response status is `400`
- AND the body indicates the code has expired

#### Scenario: Password too short

- GIVEN any state
- WHEN the user sends `PATCH /auth/password` with `{ code: "654321", newPassword: "abc" }`
- THEN the response status is `400`
- AND the body contains a validation error for `newPassword`

---

### Requirement: GET /auth/me — Include email in response

The existing `GET /auth/me` endpoint MUST include the `email` field in its response when the field is non-null.

#### Scenario: Profile returns email

- GIVEN the admin user has set an email
- WHEN they send `GET /auth/me`
- THEN the response includes `{ email: "admin@example.com" }`

#### Scenario: Profile returns null email

- GIVEN the admin user has NOT set an email
- WHEN they send `GET /auth/me`
- THEN the response includes `{ email: null }` or omits email
