# Admin Profile API — Specification

**Domain**: `admin-profile` · **Change**: `admin-profile-settings` · **Type**: Full spec (new capability)

## Purpose

Define the API contract for authenticated admin profile management: updating profile fields (username/email) and changing passwords with TOTP 2FA verification.

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

### Requirement: Change Password — `PATCH /auth/password`

Changes the authenticated user's password. The `currentPassword` MUST be validated server-side; when 2FA is enabled, a valid TOTP code or a single-use recovery code is required.

- **Method**: `PATCH`
- **Auth**: `authMiddleware` (JWT required) + `authLimiter` (5 requests / 15 min)
- **Body**: `{ currentPassword: string, totpCode?: string, recoveryCode?: string, newPassword: string }`

The system MUST reject with `403 FORBIDDEN` if `currentPassword` is missing or does not match the stored hash.
The system MUST reject with `400` if `newPassword` is fewer than 12 characters.

If `User.twoFactorEnabled = true`:
- The system MUST require `currentPassword` AND exactly one of `totpCode` | `recoveryCode` (XOR). Neither present → `400`; both present → `400`.
- `totpCode` MUST verify within TOTP window 1 (`400` if invalid).
- `recoveryCode` MUST match a stored bcrypt hash (`400` if invalid) and MUST be consumed (single-use).

If `User.twoFactorEnabled = false`:
- `totpCode`/`recoveryCode` MUST NOT be required and MUST be ignored if present.

On success (`200`), the system MUST store the new password hashed with bcrypt (cost 12) and MUST return `{ message: "Password updated successfully" }`. Existing JWT sessions MUST remain valid.

The system MUST reject with `429` when the `authLimiter` limit is exceeded.

- Prisma: `User.password` (update), `User.twoFactorEnabled` (read), `User.recoveryCodes` (read + consume)

#### Scenario: Success, 2FA disabled

- GIVEN `twoFactorEnabled = false` and correct `currentPassword`
- WHEN they `PATCH /auth/password { currentPassword, newPassword }`
- THEN `200` and the new password hash is stored

#### Scenario: Wrong current password, 2FA disabled

- GIVEN `twoFactorEnabled = false`
- WHEN they `PATCH /auth/password { currentPassword: "wrong", newPassword }`
- THEN `403` and password unchanged

#### Scenario: Success, 2FA enabled, TOTP

- GIVEN `twoFactorEnabled = true`
- WHEN they `PATCH /auth/password { currentPassword, totpCode: "<valid>", newPassword }`
- THEN `200` and the new password hash is stored

#### Scenario: Success, 2FA enabled, recovery code

- GIVEN `twoFactorEnabled = true`
- WHEN they `PATCH /auth/password { currentPassword, recoveryCode: "<valid>", newPassword }`
- THEN `200`, password updated, and the recovery code is consumed

#### Scenario: Recovery code reused

- GIVEN the recovery code was consumed by a previous change
- WHEN it is submitted again
- THEN `400` and password unchanged

#### Scenario: Neither TOTP nor recovery provided

- GIVEN `twoFactorEnabled = true`
- WHEN they `PATCH /auth/password { currentPassword, newPassword }`
- THEN `400`

#### Scenario: Both TOTP and recovery provided

- GIVEN `twoFactorEnabled = true`
- WHEN they `PATCH /auth/password { currentPassword, totpCode, recoveryCode, newPassword }`
- THEN `400`

#### Scenario: Wrong TOTP code

- GIVEN `twoFactorEnabled = true`
- WHEN they `PATCH /auth/password { currentPassword, totpCode: "000000", newPassword }`
- THEN `400` and password unchanged

#### Scenario: Password too short

- GIVEN any state
- WHEN they `PATCH /auth/password` with `newPassword` of 11 characters
- THEN `400` with a validation error for `newPassword`

#### Scenario: Rate-limited password change

- GIVEN the admin exceeded 5 requests in 15 minutes
- WHEN they `PATCH /auth/password`
- THEN `429`

---

### Requirement: GET /auth/me — include email and 2FA status

The existing `GET /auth/me` endpoint MUST include the `email` field in its response when the field is non-null, and MUST include `twoFactorEnabled` (boolean) reflecting `User.twoFactorEnabled`.

#### Scenario: Profile returns email

- GIVEN the admin user has set an email
- WHEN they send `GET /auth/me`
- THEN the response includes `{ email: "admin@example.com" }`

#### Scenario: Profile returns null email

- GIVEN the admin user has NOT set an email
- WHEN they send `GET /auth/me`
- THEN the response includes `{ email: null }` or omits email

#### Scenario: Profile returns 2FA status

- GIVEN the admin user has 2FA enabled
- WHEN they send `GET /auth/me`
- THEN the response includes `{ twoFactorEnabled: true }`