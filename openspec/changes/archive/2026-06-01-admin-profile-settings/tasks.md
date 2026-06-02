# Tasks: Admin Profile Settings

## Phase A: Data Layer

- [x] A1: Add `email String? @unique` to User model in `api/prisma/schema.prisma`
- [x] A2: Run `npx prisma db push` to apply schema change

## Phase B: Shared Schemas

- [x] B1: Create `packages/shared/src/schemas/profile.schema.ts` — 3 Zod schemas: `updateProfileSchema` (username?, email?, currentPassword), `sendVerificationCodeSchema` (empty object), `changePasswordSchema` (code: len6, newPassword: min6)
- [x] B2: Add `export * from './profile.schema.js'` to `packages/shared/src/schemas/index.ts`
- [x] B3: Export `UpdateProfileInput`, `UpdateProfileResponse`, `SendVerificationCodeResponse`, `ChangePasswordInput`, `ChangePasswordResponse` types from `packages/shared/src/types/index.ts`

## Phase C: API — Verification Code Service

- [x] C1: Create `api/src/services/verification-code.service.ts` — singleton with `Map<string, { code, expiresAt, used }>`, `generate(userId)` (6-digit, 10min TTL, overwrites previous), `validate(userId, code)` (checks missing/expired/used/mismatch, marks used=true)

## Phase D: API — Auth Service & Controller

- [x] D1: Add `updateProfile(id, data)` to `api/src/services/auth.service.ts` — validates currentPassword via bcrypt, checks username/email uniqueness, calls prisma.user.update, returns user without password
- [x] D2: Add `changePassword(userId, code, newPassword)` — validates code via VerificationCodeService, hashes newPassword with bcrypt, updates user, marks code used
- [x] D3: Update `getUserById` select to include `email`, update `meHandler` to return `email` in response
- [x] D4: Add `updateProfileHandler`, `requestCodeHandler`, `changePasswordHandler` to `api/src/controllers/auth.controller.ts` — Zod parse, call service, return typed responses
- [x] D5: Add routes in `api/src/routes/auth.routes.ts`: `PATCH /profile`, `POST /verification-code`, `PATCH /password` (all behind authMiddleware)

## Phase E: Frontend — API & Hooks

- [x] E1: Add `updateProfile(data)`, `sendVerificationCode()`, `changePassword(data)` methods to `admin-panel/src/api/auth.ts`
- [x] E2: Add `useUpdateProfile`, `useSendVerificationCode`, `useChangePassword` mutation wrappers to `admin-panel/src/hooks/useAuth.ts`

## Phase F: Frontend — Profile UI

- [x] F1: Rewrite `admin-panel/src/pages/settings/ProfileSettings.tsx` — editable username + email fields, currentPassword gate, pre-fill from JWT/API, loading/success/error inline feedback, client-side email validation

## Phase G: Frontend — Security UI

- [x] G1: Rewrite `admin-panel/src/pages/settings/SecuritySettings.tsx` — 2-step flow: Step 1 (currentPassword + newPassword + confirmPassword → Continue), Step 2 (6-digit code input + Change Password button + resend with 30s cooldown), success notification resets to Step 1 after 3s

## Phase H: i18n

- [x] H1: Add ~15 translation keys to both ES and EN in `admin-panel/src/i18n/translations.ts` — profile labels (email, currentPassword gate, save), security labels (step labels, code input, resend, cooldown), error/success messages for both forms

## Phase I: Verification

- [x] I1: Run `npx tsc --noEmit` in all packages — fix type errors
- [x] I2: Run backend + frontend tests
