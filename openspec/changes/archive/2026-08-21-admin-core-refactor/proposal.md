# Proposal: Admin Core Refactor

## Intent

Refactorizar el panel administrativo para unificar patrones de UI, agregar gestión de estados a todas las entidades, eliminar funcionalidades redundantes (featured/reorder) e implementar Pages con API real para organizar secciones del homepage.

## Scope

### In Scope
1. **Status field** — Agregar `status` (DRAFT/PUBLISHED/PRIVATE/ARCHIVED) + `publishedAt` a Services, Products, Tools, SuccessCases (como BlogPost)
2. **Featured cleanup** — Mantener solo en Products y Tools. Remover de Services y SuccessCases (DB, API, UI)
3. **Reorder removal** — Eliminar `reorder` de Services, Products, Tools, SuccessCases (DB, API, UI)
4. **Pages con API** — Crear modelo `SiteSection` en Prisma, API REST CRUD + reorder, conectar UI admin. Eliminar localStorage
5. **Botón Volver** — Componente compartido `BackButton` en todas las edit pages
6. **Confirmación eliminar** — Modal compartido `ConfirmDelete` para todas las entidades
7. **Fix navegación editar** — Tools y Blog a SPA navigation (Link/navigate)

### Out of Scope
- Inbox redesign (Cambio B)
- Blog search/filters frontend (Cambio B)
- Tests de frontends
- ESLint/Prettier config
- Lazy loading de rutas

## Approach

Por capas de arquitectura: shared schemas → Prisma DB → API services → API controllers/routes → Admin UI (hooks → components → pages).

Cada sub-cambio se implementa siguiendo la estructura existente del monorepo, manteniendo los patrones de TanStack Query, soft-delete y validación Zod.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/shared/src/schemas/` | Modified | Status field en schemas de Service, Product, Tool, SuccessCase |
| `api/prisma/schema.prisma` | Modified | +status +publishedAt en 4 modelos, -featured en 2, -order en 4, +SiteSection |
| `api/src/services/*.service.ts` | Modified | Status CRUD, featured removal, reorder removal |
| `api/src/controllers/*.controller.ts` | Modified | Nuevos endpoints status, remover reorder/featured |
| `api/src/routes/*.routes.ts` | Modified | Nuevas rutas status |
| `admin-panel/src/hooks/` | Modified | Hooks para status, SiteSection |
| `admin-panel/src/components/` | Modified | Forms + Lists con status, ConfirmDelete, BackButton |
| `admin-panel/src/pages/` | Modified | Edit pages con botón volver, listas con status |
| `admin-panel/src/i18n/translations.ts` | Modified | Nuevas traducciones |
| `admin-panel/src/api/` | New | siteSections.api.ts |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|-------------|
| Migración DB existente con datos | Med | Prisma migrate con defaults, seed actualizado |
| Romper frontends client/recruiter por cambios en API | Low | API backwards-compatible (campos opcionales) |
| SiteSection conflictos con datos existentes | Low | Modelo nuevo, sin datos previos |

## Rollback Plan

1. `git checkout` de todos los archivos modificados
2. `prisma migrate down` para revertir migración DB
3. Re-importar seed si es necesario

## Success Criteria

- [ ] 63+ tests de API pasando (nuevos tests para status)
- [ ] TypeScript 0 errores en todos los packages
- [ ] Tools y Blog edit navegan sin recargar página
- [ ] Todas las edit pages tienen botón Volver
- [ ] Todas las entidades tienen confirmación al eliminar
- [ ] Services, Products, Tools, SuccessCases muestran status en lista y formulario
- [ ] Pages funciona con DB real y reordena secciones del homepage
- [ ] Sin errores de build en los 3 frontends
