# Design: Admin Profile Settings

## Overview

Technical design for adding admin profile management capabilities: email field on User model, profile edit API + UI, verification-code-backed password change flow.

**Specs**: `openspec/changes/admin-profile-settings/specs/01-profile-api.md`, `02-profile-frontend.md`, `03-security-frontend.md`

---

## Technical Approach

Follow the existing patterns — Express routes/controllers/services, Prisma ORM, shared Zod schemas in `@jsoft/shared`, and React 19 components in the admin panel. The change spans 4 packages in dependency order:

```
@jsoft/shared (schemas + types) → api (prisma + service + controller + routes) → admin-panel (hooks + components + i18n)
```

---

## Architecture Decisions

### Decision: In-memory verification code storage
**Choice**: `Map<string, VerificationCodeEntry>` in a singleton module
**Alternatives**: Database table (more infrastructure), Redis (overkill for single-admin)
**Rationale**: Single-admin panel doesn't need persistent code storage. If the server restarts, codes are lost — acceptable because the admin can request a new one. No DB migration, no external dependency.

### Decision: Dev-mode code return in response body
**Choice**: When `NODE_ENV !== 'production'`, the verification code is returned in the API response and logged to console
**Alternatives**: Email-only (blocked in dev without email setup), SMS (overkill)
**Rationale**: In production, the code would be emailed. In development, returning it removes friction without changing the contract.

### Decision: No JWT invalidation on password change
**Choice**: Existing JWT sessions remain valid after password change
**Alternatives**: Blacklist old tokens, use refresh token rotation
**Rationale**: For a single-admin panel, the complexity of token invalidation isn't justified. The admin uses one device/browser. The token has a finite expiry (7d default).

### Decision: currentPassword as gate for profile updates
**Choice**: Every `PATCH /auth/profile` call requires `currentPassword` even if only changing email
**Alternatives**: Allow email-only changes without password, send confirmation email
**Rationale**: Email is a sensitive field (password reset vectors). Requiring `currentPassword` prevents token-only hijack — if a JWT is stolen, the attacker still can't change credentials.

### Decision: `confirmPassword` is frontend-only, not in shared schema
**Choice**: `changePasswordSchema` sends `{ code, newPassword }` — the frontend validates `confirmPassword === newPassword` client-side
**Alternatives**: Include `confirmPassword` in the Zod schema with `.refine`
**Rationale**: Matching confirmation is a UX concern, not an API concern. The API only needs the actual new password. The spec's `confirmPassword` field in the frontend flow validates before sending.

### Decision: Separate `updateProfileSchema` in a new file `profile.schema.ts`
**Choice**: Create a dedicated file rather than extending login.schema.ts
**Alternatives**: Add to login.schema.ts (overloaded), create inline in auth service (no reuse)
**Rationale**: The shared package is organized by domain per file. A new `profile.schema.ts` keeps clean separation and follows the established pattern (`service.schema.ts`, `product.schema.ts`, etc.).

---

## Data Flow

### Flow 1: Profile Update

```
User fills form → clicks Save
  │
  ├─ Client: validate client-side (email format, username length)
  │
  ├─ PATCH /auth/profile { username?, email?, currentPassword }
  │     │
  │     ├─ authMiddleware → decode JWT, attach req.user
  │     ├─ updateProfileSchema.parse(body) → validate with Zod
  │     ├─ auth.service.updateProfile(userId, data)
  │     │     ├─ bcrypt.compare(currentPassword, stored.hash)
  │     │     ├─ if wrong → throw 401
  │     │     ├─ if username changed → check unique (findUnique)
  │     │     ├─ if email changed → check unique
  │     │     ├─ prisma.user.update({ where: id, data: { username, email } })
  │     │     └─ return { id, username, email, role }
  │     │
  │     └─ 200 { id, username, email, role }
  │
  └─ UI: show success notification, update displayed values
```

### Flow 2: Password Change (2-step)

```
STEP 1 ──────────────────────────────────────────
User fills currentPassword + newPassword + confirmPassword → clicks "Continue"
  │
  ├─ Client: validate newPassword === confirmPassword, min 6 chars
  │
  ├─ POST /auth/verification-code (body: {})
  │     │
  │     ├─ authMiddleware → decode JWT
  │     ├─ verificationCodeService.generate(userId)
  │     │     ├─ generate 6-digit random string
  │     │     ├─ store in Map: key=userId, value={ code, expiresAt, used: false }
  │     │     ├─ overwrite any previous code for this userId
  │     │     └─ return code
  │     │
  │     └─ 200 { code: "123456", expiresIn: 600 }
  │          (in dev — production returns { message: "Code sent" })
  │
  └─ UI: show Step 2 (code input), store newPassword in local state
       Display "A verification code has been sent..."

STEP 2 ──────────────────────────────────────────
User enters 6-digit code → clicks "Change Password"
  │
  ├─ PATCH /auth/password { code, newPassword }
  │     │
  │     ├─ authMiddleware → decode JWT
  │     ├─ changePasswordSchema.parse(body)
  │     ├─ auth.service.changePassword(userId, code, newPassword)
  │     │     ├─ verificationCodeService.validate(userId, code)
  │     │     │     ├─ look up Map.get(userId)
  │     │     │     ├─ if missing → throw 400 "No verification code"
  │     │     │     ├─ if expired → throw 400 "Code expired"
  │     │     │     ├─ if used → throw 400 "Code already used"
  │     │     │     ├─ if mismatch → throw 400 "Invalid code"
  │     │     │     ├─ mark used = true
  │     │     │     └─ return true
  │     │     ├─ bcrypt.hash(newPassword, 12)
  │     │     ├─ prisma.user.update({ where: id, data: { password } })
  │     │     └─ return { message: "Password updated successfully" }
  │     │
  │     └─ 200 { message }
  │
  └─ UI: show success notification → after 3s reset to Step 1 (clear all fields)
```

---

## File Changes

| File | Action | Grounded In |
|------|--------|-------------|
| `api/prisma/schema.prisma` | Modify — add `email String? @unique` to User | Spec req: Profile Update (email field) |
| `packages/shared/src/schemas/profile.schema.ts` | Create — `updateProfileSchema`, `changePasswordSchema`, `verificationCodeSchema` + types | Spec req: Zod validation for 3 endpoints |
| `packages/shared/src/schemas/index.ts` | Modify — add `export * from './profile.schema.js'` | Convention: re-export new schema |
| `packages/shared/src/types/index.ts` | Modify — export new types (`UpdateProfileInput`, `UpdateProfileResponse`, `ChangePasswordInput`) | Convention: re-export new types |
| `api/src/services/verification-code.service.ts` | Create — `VerificationCodeService` class with in-memory Map | Spec req: POST /auth/verification-code, PATCH /auth/password |
| `api/src/services/auth.service.ts` | Modify — add `updateProfile()`, `changePassword()`, update `getUserById()` to include email | Spec req: all 3 API endpoints |
| `api/src/controllers/auth.controller.ts` | Modify — add `updateProfileHandler`, `requestCodeHandler`, `changePasswordHandler`; update `meHandler` | Spec req: wire endpoints |
| `api/src/routes/auth.routes.ts` | Modify — add `PATCH /profile`, `POST /verification-code`, `PATCH /password` | Spec req: route registration |
| `admin-panel/src/api/auth.ts` | Modify — add `updateProfile()`, `requestVerificationCode()`, `changePassword()` | Spec req: frontend API calls |
| `admin-panel/src/pages/settings/ProfileSettings.tsx` | Rewrite — editable form with username, email, currentPassword, save button, error/success feedback | Spec req: admin-profile-frontend |
| `admin-panel/src/pages/settings/SecuritySettings.tsx` | Rewrite — 2-step flow with code entry, resend cooldown, loading/error/success states | Spec req: admin-security-password |
| `admin-panel/src/i18n/translations.ts` | Modify — add ~15 new i18n keys per language for both settings forms | Spec req: i18n requirement |

---

## API Contract Reference

### `PATCH /auth/profile`
- **Body**: `updateProfileSchema` — `{ username?: string (3-50 chars), email?: string (email format), currentPassword: string (min 1) }`
- **400**: Neither field provided, or missing currentPassword
- **401**: currentPassword doesn't match stored hash
- **409**: username or email already taken
- **200**: `{ id: string, username: string, email: string | null, role: "ADMIN" }`

### `POST /auth/verification-code`
- **Body**: none (empty `{}`)
- **200** (dev): `{ code: string (6-digit), expiresIn: 600 }`
- **200** (prod): `{ message: "Verification code sent" }`

### `PATCH /auth/password`
- **Body**: `changePasswordSchema` — `{ code: string (6-digit), newPassword: string (min 6) }`
- **400**: Invalid/expired/used code, or password too short
- **200**: `{ message: "Password updated successfully" }`

### `GET /auth/me` (updated)
- **200**: `{ id, username, email: string | null, role }` — email field added

---

## Verification Code Service (Internal Design)

```typescript
interface VerificationCodeEntry {
  code: string;
  expiresAt: Date;
  used: boolean;
}

class VerificationCodeService {
  private store = new Map<string, VerificationCodeEntry>();

  generate(userId: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.store.set(userId, {
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      used: false,
    });
    return code;
  }

  validate(userId: string, code: string): boolean {
    const entry = this.store.get(userId);
    if (!entry) throw new AppError(400, 'No verification code found');
    if (entry.used) throw new AppError(400, 'Code already used');
    if (new Date() > entry.expiresAt) {
      this.store.delete(userId);
      throw new AppError(400, 'Code has expired');
    }
    if (entry.code !== code) throw new AppError(400, 'Invalid verification code');
    entry.used = true;
    return true;
  }
}
```

The service is a singleton exported from its module. No periodic cleanup — expired codes are cleaned lazily on `validate()`. Memory leak is negligible for single-admin.

---

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | auth.service — `updateProfile`, `changePassword` | Jest + mocked Prisma, verify correct queries and error paths |
| Unit | verification-code.service — generate, validate, expiry, reuse guard | Pure logic, no DB, test all 4 error conditions |
| Unit | shared schemas — updateProfileSchema, changePasswordSchema | Zod parse/reject on valid/invalid inputs |
| Integration | PATCH /auth/profile — full HTTP roundtrip | Supertest + real Prisma test DB |
| Integration | POST /auth/verification-code → PATCH /auth/password | Full 2-step flow test |
| Frontend | ProfileSettings — render, fill, submit | Component test (Vitest) or manual |
| Frontend | SecuritySettings — 2-step transition, code entry, resend cooldown | Component test or manual |

---

## Migration / Rollout

**Migration**: After adding `email String? @unique` to schema, run `npx prisma db push --accept-data-loss`. No data loss — the field is optional. The `--accept-data-loss` flag is needed only if dropping columns; here we're adding one. Standard `prisma db push` suffices.

**Rollback**: Remove the `email` field from schema, re-run `prisma db push`, revert code changes. No data migration needed for a nullable field.

**Dev-mode detection**: Read `process.env.NODE_ENV` (already used in `app.ts` for error handling). Create helper function `isDev()` or inline the check.

---

## Open Questions

- [ ] Confirm dev-mode behavior: should `POST /auth/verification-code` always return the code (even in production) for the initial implementation, since there's no email service configured? Spec says "dev mode" — but if prod has no email, it's broken. Decision: return code always for now; add email dependency later.
- [ ] The `getUserById()` currently returns createdAt/updatedAt. Should the GET /auth/me response include these? Current meHandler only returns id, username, role. Add email, keep existing fields unchanged.
