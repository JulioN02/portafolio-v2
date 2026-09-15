# Reporte de Archivado: admin-totp-2fa

**Archivado**: 2026-09-14
**Desde**: artefactos en Engram (`sdd/admin-totp-2fa/*`) — no existía carpeta `openspec/changes/admin-totp-2fa/` en disco
**Hacia**: registro de archivado en Engram (`sdd/admin-totp-2fa/archive-report`) + carpeta de auditoría `openspec/changes/archive/2026-09-14-admin-totp-2fa/`
**Modo de almacén de artefactos**: híbrido (engram + openspec)
**Proyecto**: portafolio-v2 (monorepo PortafolioV2JSS)

---

## Resumen del cambio

El flujo de cambio de contraseña del admin dependía de un código de verificación por email (nodemailer/SMTP + modelo `VerificationCode` en BD). Ese camino era frágil en Vercel serverless y tenía brechas reales: `currentPassword` nunca se validaba en el servidor, `PATCH /auth/password` no tenía rate limiter, el mínimo de longitud de contraseña difería entre cliente (6) y API (12), y producción sufrió un 500 por migración no aplicada. El cambio reemplaza el código por email con TOTP 2FA usado **exclusivamente** para verificar cambios de contraseña (sin 2FA de login) y cierra las brechas.

Capacidad nueva:
1. **admin-totp-2fa** — Setup/enable/disable de TOTP (`POST /auth/2fa/setup|enable|disable`), secreto cifrado en reposo con AES-256-GCM (`TOTP_ENCRYPTION_KEY`, formato `iv:tag:ciphertext` base64), 10 códigos de recuperación `XXXX-XXXX` con hash bcrypt(10), de un solo uso y mostrados una única vez, estado 2FA expuesto en `GET /auth/me`, todo protegido por `authMiddleware` + `authLimiter` (5/15min).

Capacidades modificadas (delta):
2. **admin-profile** (spec `01-profile-api.md`) — Eliminado `POST /auth/verification-code` (flujo de email completo: ruta, controlador, `verification-code.service.ts`, `email.service.ts`, deps nodemailer, `sendVerificationCodeSchema`/`SendVerificationCodeResponse`, modelo + tabla `VerificationCode`). `PATCH /auth/password` pasa a `{ currentPassword, totpCode?, recoveryCode?, newPassword }` con validación server-side de `currentPassword`, mínimo 12, `authLimiter` y lógica XOR (TOTP o recovery, nunca ambos/ninguno) cuando 2FA está activo. `GET /auth/me` añade `twoFactorEnabled`.
3. **admin-security-password** (spec `03-security-frontend.md`) — Flujo de cambio de contraseña de un solo paso (sin paso de envío de código), UI de enable/disable de 2FA con QR y códigos de recuperación mostrados una vez, secciones gobernadas por `twoFactorEnabled`, mínimo 12 en cliente, claves i18n ES/EN.

**Corrección aplicada durante el archivado (WARNING-1 del verify-report)**: el texto de los specs delta decía `401` para `currentPassword` incorrecto en el cambio de contraseña y en el disable de 2FA; la implementación devuelve `403 FORBIDDEN` (decisión de diseño: el usuario ya está autenticado, `401` es engañoso; el scope final del orquestador confirma 403). Los specs principales quedaron sincronizados con `403 FORBIDDEN`.

## Implementación

- Tareas (Engram #1345): 27 totales — 25 de apply completadas (fases 1–5) + 2 post-apply pendientes por diseño (4.4 migración prod A → deploy → migración B; 4.5 rollout de `TOTP_ENCRYPTION_KEY` y retiro de SMTP en Vercel).
- Apply (Engram #1357): COMPLETE — git status coincide exactamente con apply-progress; 4 archivos eliminados (email.service, verification-code.service y sus tests), 2 directorios de migración nuevos.

## Artefactos en el archivo

| Artefacto | Ubicación | Estado |
|-----------|-----------|--------|
| Propuesta | Engram #1337 | ✅ |
| Diseño | Engram #1341 | ✅ |
| Spec (deltas, 3 dominios) | Engram #1342 | ✅ |
| Tareas | Engram #1345 | ✅ (27/27; 4.4/4.5 post-apply) |
| Apply progress | Engram #1357 | ✅ (COMPLETE) |
| Reporte de verificación | Engram #1361 | ✅ (PASS WITH WARNINGS, 0 CRITICAL) |
| Reporte de archivado | Engram (`sdd/admin-totp-2fa/archive-report`) + este archivo | ✅ |

## Especs sincronizadas (delta → principal)

| Dominio | Acción | Detalles |
|---------|--------|----------|
| `admin-totp-2fa` | **Creada** | `openspec/specs/admin-totp-2fa/spec.md` — spec completa (8 requisitos, 23 escenarios) con 401→403 corregido en TOTP-2FA-04 |
| `admin-profile` | **Fusionada** | `openspec/specs/admin-profile/01-profile-api.md` — 1 REMOVED (Request Verification Code), 2 MODIFIED (Change Password reescrito con 403/XOR/min-12/authLimiter; GET /auth/me con `twoFactorEnabled`), 1 preservado (Profile Update) |
| `admin-security-password` | **Fusionada** | `openspec/specs/admin-profile/03-security-frontend.md` — 3 REMOVED (2-step flow, Step 2 code entry, Resend code with cooldown), 1 MODIFIED (Single-step password change flow, con mapeo 403), 5 ADDED (2FA enable UI, Recovery codes display once, 2FA disable UI, 2FA status display, i18n ES/EN), 1 preservado (Loading/success/error states) |

**Total**: 1 spec principal creada, 2 fusionadas, 3 dominios sincronizados.

### ⚠️ AVISO — Fusión destructiva (regla `rules.archive` de openspec/config.yaml)

Este archivado **sí** contiene remociones de tamaño considerable en specs principales:

- `01-profile-api.md`: se eliminó el requisito completo `Request Verification Code — POST /auth/verification-code` (~30 líneas, todo el flujo de email) y se reemplazó el requisito `Change Password` completo.
- `03-security-frontend.md`: se eliminaron 3 de 4 requisitos originales (~50% del archivo): el flujo de 2 pasos, la UI de entrada de código y el reenvío de código con cooldown.

Estas remociones son **esperadas y especificadas**: el alcance del proposal (#1337) incluye explícitamente la eliminación del flujo de email, y el verify-report (#1361) confirma la implementación completa (archivos borrados, migración destructiva B `drop_verification_code` correcta y segura en el orden A → deploy → B). La sincronización se realizó con la autorización del orquestador. La fusión **preservó** los requisitos no mencionados en el delta (Profile Update; Loading/success/error states).

## Verificación (puertas)

| Puerta | Resultado |
|--------|-----------|
| Build shared (tsup CJS+ESM+DTS) | ✅ PASS |
| Typecheck | ✅ 5/5 paquetes (shared, api, admin-panel, client-site, recruiter-site) |
| Tests API (Jest + coverage) | ✅ 26 suites / 391 tests, 0 fallos; cobertura 87.66% stmts / 75.8% branch / 94.04% funcs / 93.09% lines (umbral ≥70%) |
| Vitest shared | ✅ 21 archivos / 225 tests |
| Vitest admin-panel | ✅ 4 archivos / 18 tests |
| Matriz de cumplimiento | ✅ 47/47 escenarios: 44 compliant + 2 deviation-aceptada (403 vs 401, corregida en spec) + 1 estructural con sugerencia |
| Cripto (AES-256-GCM, otplib window 1, recovery bcrypt single-use) | ✅ 19 tests totp.service, verificación cruzada con diseño |
| Cobertura de archivos cambiados | ✅ ≈98% líneas (totp.service 98.3%, auth.service 98.13%) |

## Seguimientos abiertos (no implementados)

1. **Post-apply ops pendientes (tareas 4.4/4.5)** — Ejecutar en producción: migración A (`20260914120000_add_two_factor_fields`) → deploy → migración B (`20260914120001_drop_verification_code`, destructiva); luego rollout de `TOTP_ENCRYPTION_KEY` en Vercel + `api/.env` y retiro de variables SMTP. Sin `TOTP_ENCRYPTION_KEY`, los endpoints 2FA fallan en modo fail-closed (500) — por diseño.
2. **SecuritySettings sin tests de componente** (WARNING-2) — Los 15 escenarios UI se verificaron estructuralmente; no hay suite de componentes para la página. Recomendado: tests Vitest para los flujos enable/disable/cambio de contraseña.
3. **Sin evidencia TDD para fase 3 (admin-panel)** (WARNING-3) — hooks/i18n/página no tienen ciclo RED/GREEN registrado; convención del repo: sin tests de página, comportamiento cubierto en la capa de integración de API.
4. **Sugerencias del verify** — Tests 429 explícitos para `POST /2fa/setup|enable|disable`; test de login con `twoFactorEnabled=true` (TOTP-2FA-01); `img alt="TOTP QR"` hardcodeado (accesibilidad, podría i18n-izarse).
5. **Estado inconsistente (no-spec)**: `twoFactorEnabled=true` con `twoFactorSecret=null` → 500 (solo posible por edición manual de BD).

## Observaciones en Engram (trazabilidad)

| Artefacto | ID de observación |
|-----------|-------------------|
| Propuesta | #1337 |
| Diseño | #1341 |
| Spec (deltas, 3 dominios) | #1342 |
| Tareas | #1345 |
| Apply progress | #1357 |
| Reporte de verificación | #1361 |
| Reporte de archivado | *(este reporte — topic_key `sdd/admin-totp-2fa/archive-report`)* |

## Fuente de verdad actualizada

Las siguientes specs principales reflejan ahora el comportamiento nuevo:

- `openspec/specs/admin-totp-2fa/spec.md` (nueva)
- `openspec/specs/admin-profile/01-profile-api.md`
- `openspec/specs/admin-profile/03-security-frontend.md`

## Ciclo SDD completo

El cambio fue planificado, especificado, diseñado, implementado, verificado y archivado por completo.
Listo para el siguiente cambio.