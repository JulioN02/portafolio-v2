# Admin TOTP 2FA Specification

**Domain**: `admin-totp-2fa` · **Change**: `admin-totp-2fa` · **Type**: Full spec (new capability)

## Purpose

TOTP 2FA verifies admin password changes only. No login 2FA. Secret encrypted at rest (AES-256-GCM); 10 single-use recovery codes back up password change.

## Requirements

### Requirement: TOTP-2FA-01 — Scope: password-change verification only

The system SHALL use TOTP 2FA exclusively to verify `PATCH /auth/password`. The system SHALL NOT require 2FA at login or on any endpoint other than password change and 2FA management.
- Prisma: `User.twoFactorEnabled`

#### Scenario: Login unaffected

- GIVEN an admin with `twoFactorEnabled = true`
- WHEN they `POST /auth/login` with valid credentials
- THEN login succeeds with no TOTP step

### Requirement: TOTP-2FA-02 — Setup — `POST /auth/2fa/setup`

Protected by `authMiddleware` + `authLimiter` (5/15min). The system MUST generate a TOTP secret (otplib authenticator, 30s step), encrypt it (AES-256-GCM, `TOTP_ENCRYPTION_KEY`) and store it in `User.twoFactorSecret`, MUST keep `twoFactorEnabled = false`, and MUST return `200 { otpauthUrl, qrDataUrl, secret }`. If 2FA is already enabled, the system MUST reject with `409` (rotation out of scope).
- Prisma: `User.twoFactorSecret`, `User.twoFactorEnabled`

#### Scenario: Setup returns secret and QR

- GIVEN an authenticated admin with `twoFactorEnabled = false`
- WHEN they `POST /auth/2fa/setup`
- THEN `200` with `otpauthUrl`, `qrDataUrl` (data URL PNG), `secret`
- AND `twoFactorEnabled` remains `false`

#### Scenario: Setup when already enabled

- GIVEN an authenticated admin with `twoFactorEnabled = true`
- WHEN they `POST /auth/2fa/setup`
- THEN `409`

#### Scenario: Setup rate-limited

- GIVEN the admin exceeded 5 requests in 15 minutes
- WHEN they `POST /auth/2fa/setup`
- THEN `429`

### Requirement: TOTP-2FA-03 — Enable — `POST /auth/2fa/enable`

Protected by `authMiddleware` + `authLimiter`. Body MUST contain `totpCode` (6 digits). The system MUST verify `totpCode` against the stored secret with window 1. On success: MUST set `twoFactorEnabled = true`, MUST generate 10 recovery codes, MUST store only bcrypt(10) hashes in `User.recoveryCodes`, and MUST return `200 { recoveryCodes }` — plaintext codes returned exactly once. The system MUST reject with `400` if `totpCode` is invalid and with `409` if 2FA is already enabled.
- Prisma: `User.twoFactorEnabled`, `User.twoFactorSecret`, `User.recoveryCodes`

#### Scenario: Enable with valid code

- GIVEN setup completed and the user has a valid TOTP code
- WHEN they `POST /auth/2fa/enable { totpCode: "<valid>" }`
- THEN `200` with exactly 10 codes matching `/^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$/`
- AND `twoFactorEnabled = true` and only bcrypt hashes stored

#### Scenario: Enable with wrong code

- GIVEN setup completed
- WHEN they `POST /auth/2fa/enable { totpCode: "000000" }`
- THEN `400` and `twoFactorEnabled` remains `false`

#### Scenario: Enable without prior setup

- GIVEN no pending secret exists
- WHEN they `POST /auth/2fa/enable { totpCode: "<valid>" }`
- THEN `400`

#### Scenario: Enable when already enabled

- GIVEN `twoFactorEnabled = true`
- WHEN they `POST /auth/2fa/enable`
- THEN `409`

#### Scenario: Enable rate-limited

- GIVEN the admin exceeded 5 requests in 15 minutes
- WHEN they `POST /auth/2fa/enable`
- THEN `429`

### Requirement: TOTP-2FA-04 — Disable — `POST /auth/2fa/disable`

Protected by `authMiddleware` + `authLimiter`. Body MUST contain `currentPassword` and `totpCode`. The system MUST reject with `403 FORBIDDEN` if `currentPassword` does not match the stored hash (the user is already authenticated, so `401` would be misleading; `403` signals the authenticated user lacks authorization for this action) and with `400` if `totpCode` is invalid (window 1). On success: MUST clear `twoFactorSecret` and `recoveryCodes`, set `twoFactorEnabled = false`, and return `200`. The system MUST reject with `409` if 2FA is not enabled.
- Prisma: `User.twoFactorEnabled`, `User.twoFactorSecret`, `User.recoveryCodes`

#### Scenario: Disable with valid credentials

- GIVEN `twoFactorEnabled = true`
- WHEN they `POST /auth/2fa/disable { currentPassword: "correct", totpCode: "<valid>" }`
- THEN `200` and secret, codes cleared, `twoFactorEnabled = false`

#### Scenario: Wrong current password

- GIVEN `twoFactorEnabled = true`
- WHEN they `POST /auth/2fa/disable { currentPassword: "wrong", totpCode: "<valid>" }`
- THEN `403` and 2FA remains enabled

#### Scenario: Wrong TOTP code

- GIVEN `twoFactorEnabled = true`
- WHEN they `POST /auth/2fa/disable { currentPassword: "correct", totpCode: "000000" }`
- THEN `400` and 2FA remains enabled

#### Scenario: Disable when not enabled

- GIVEN `twoFactorEnabled = false`
- WHEN they `POST /auth/2fa/disable`
- THEN `409`

#### Scenario: Disable rate-limited

- GIVEN the admin exceeded 5 requests in 15 minutes
- WHEN they `POST /auth/2fa/disable`
- THEN `429`

### Requirement: TOTP-2FA-05 — Recovery codes lifecycle

At enable the system MUST generate exactly 10 codes (format `XXXX-XXXX`, CSPRNG, pairwise distinct), MUST store only bcrypt(10) hashes, and MUST return plaintext once. Each code SHALL be single-use: a consumed code MUST be removed and MUST NOT verify again. Recovery codes SHALL be accepted only as an alternative to `totpCode` on `PATCH /auth/password`.
- Prisma: `User.recoveryCodes`

#### Scenario: Single-use enforcement

- GIVEN a recovery code was already consumed in a password change
- WHEN the same code is submitted again
- THEN `400` and password unchanged

#### Scenario: All codes consumed

- GIVEN all 10 codes have been consumed
- WHEN a password change uses another recovery code
- THEN `400` (TOTP required)

### Requirement: TOTP-2FA-06 — Secret storage and encryption

`User.twoFactorSecret` MUST be encrypted at rest with AES-256-GCM (`node:crypto`, no new dep), ciphertext format `iv:tag:ciphertext` base64, key MUST come from `TOTP_ENCRYPTION_KEY` env var (32-byte base64). The plaintext secret MUST NOT be logged, MUST NOT appear in any response after setup, and 2FA operations MUST fail closed if the key is unset.
- Prisma: `User.twoFactorSecret`

#### Scenario: Secret never exposed after setup

- GIVEN 2FA is enabled
- WHEN any endpoint responds (including `GET /auth/me`)
- THEN the response contains neither `twoFactorSecret` nor the plaintext secret

### Requirement: TOTP-2FA-07 — Brute-force protection

All 2FA endpoints MUST be protected by `authLimiter` (5 requests / 15 min). Exceeding the limit MUST return `429`.

#### Scenario: Brute force on TOTP blocked

- GIVEN 5 failed attempts within 15 minutes
- WHEN the 6th attempt hits any 2FA endpoint
- THEN `429`

### Requirement: TOTP-2FA-08 — 2FA status via `GET /auth/me`

`GET /auth/me` MUST return `twoFactorEnabled` (boolean) reflecting `User.twoFactorEnabled`.

#### Scenario: Status surfaced

- GIVEN an admin with 2FA enabled
- WHEN they `GET /auth/me`
- THEN the response includes `twoFactorEnabled: true`