# Reporte de Archivado: project-publications

**Archivado**: 2026-09-01
**Desde**: `openspec/changes/project-publications/`
**Hacia**: `openspec/changes/archive/2026-09-01-project-publications/`
**Modo de almacén de artefactos**: híbrido (engram + openspec)
**Proyecto**: portafolio-v2 (monorepo PortafolioV2JSS)

---

## Resumen del cambio

Entidad real `Project` para proyectos de práctica, publicaciones más ricas (tags dinámicos, medios en línea, simuladores) y feed de reclutador sin la fuga de estado (la agregación devolvía filas no-PUBLISHED).

Capacidades nuevas:
1. **projects** — Modelo `Project` + API CRUD + CRUD admin + páginas cliente `/proyectos` (lista/detalle); solo filas PUBLISHED y no eliminadas en público.
2. **blog-tags** — Tags dinámicos en BlogPost (entrada libre con sugerencias, filtro público, editor admin); `category` se conserva derivado del primer tag.
3. **rich-text-editor** — Editor TipTap compartido en `@jsoft/shared` con nodos Image/Video en línea y placeholder de simulador; adoptado en formularios Project, Product, Tool y Blog.
4. **simulator-embeds** — Simuladores HTML/CSS/JS por publicación en bucket privado `simulators`, servidos por endpoint dedicado con CSP `sandbox` y renderizados en iframe `sandbox="allow-scripts"` sin `allow-same-origin`.
5. **upload-hardening** — El servidor respeta el parámetro `bucket` (allowlist), el accept del cliente coincide con las capacidades del servidor (sin SVG) y los uploads servidos usan Content-Type correcto no ejecutable.

Modificadas (delta):
6. **recruiter-projects** — Fuente real `Project` + filtro PUBLISHED/deletedAt null + posts de laboratorio/experimento como proyectos.
7. **sanitization** — Allowlist de medios en línea; simuladores vía iframe sandboxed (única excepción a DOMPurify).
8. **blog-filters** — Filtro de tags combinado con categoría y búsqueda (AND) en Client y Recruiter, con persistencia en URL.
9. **blog-post-api** — Campo `tags` en create/update, filtro `tag` y endpoint público `GET /api/blog-posts/tags`.
10. **admin-success-cases-crud** — Campos videos/links editables en crear/editar.
11. **admin-services-crud** — Campos includedItems/technicalExplanation editables en crear/editar.

## Fases y PRs fusionados

| Fase | Alcance | PR | Rama | Verdicto de verificación |
|------|---------|----|------|--------------------------|
| 1a | Proyecto: shared + api (modelo, schemas, CRUD, agregación `/api/portfolio/projects*`, sanitizeHtml) | #13 | feat/project-publications-p1a | ✅ GO (PASS WITH WARNINGS) |
| 1b | Proyecto: admin + client `/proyectos` + recruiter (modal real-Project, lab cards) | #14 | feat/project-publications-p1b | ✅ GO (PASS WITH WARNINGS) |
| 2 | Blog tags + gaps admin + uploads (migración category→tags, TagInput, bucket allowlist, filtros tags) | #15 | feat/project-publications-p2 | ✅ GO (PASS WITH WARNINGS) |
| 3 | Editor compartido + adopción de sanitización (RichTextEditor, inline image/video, renderers) | #16 | feat/project-publications-p3 | ✅ GO (PASS WITH WARNINGS) |
| 4 | Simuladores (modelo Simulator, bucket privado, endpoint /content con CSP, iframe sandboxed, hardening) | #17 | feat/project-publications-p4 | ✅ GO (PASS) |

Todos los PRs están fusionados en `main` (merge commits dd510fd, 4942dd5, e518c89, cb30f71, 49af85c).

## Artefactos en el archivo

| Artefacto | Ruta | Estado |
|-----------|------|--------|
| Propuesta | `proposal.md` | ✅ |
| Specs delta (11 dominios) | `specs/` | ✅ |
| Diseño | `design.md` | ✅ |
| Tareas | `tasks.md` | ✅ (54/54 completas, P1-01..P4-10) |
| Reporte de verificación | `verify-report.md` | ✅ (GO, fase 4 final; fases 1–3 también GO) |
| Reporte de archivado | `archive-report.md` | ✅ |

## Especs sincronizadas (delta → principal)

| Dominio | Acción | Detalles |
|---------|--------|----------|
| `projects` | **Creada** | `openspec/specs/projects/spec.md` — spec completa (5 requisitos, 12 escenarios) |
| `blog-tags` | **Creada** | `openspec/specs/blog-tags/spec.md` — spec completa (5 requisitos, 8 escenarios) |
| `rich-text-editor` | **Creada** | `openspec/specs/rich-text-editor/spec.md` — spec completa (5 requisitos, 8 escenarios) |
| `simulator-embeds` | **Creada** | `openspec/specs/simulator-embeds/spec.md` — spec completa (5 requisitos, 10 escenarios) |
| `upload-hardening` | **Creada** | `openspec/specs/upload-hardening/spec.md` — spec completa (3 requisitos, 7 escenarios) |
| `recruiter-projects` | **Fusionada** | Reemplazados `Project Listing` y `Detail Modal` (2 modificados, +4 escenarios nuevos); 0 añadidos/eliminados |
| `blog-filters` | **Fusionada** | Reemplazados `Blog Grid (Recruiter Site)` y `Client Site Blog Page` (2 modificados, +5 escenarios nuevos); 2 añadidos conservados |
| `blog-post-api` | **Fusionada** | Reemplazado `Blog Post API Routes` (1 modificado, +1 escenario `Get available tags`); 0 añadidos/eliminados |
| `admin-success-cases-crud` | **Fusionada** | Reemplazados `Create Success Case` y `Edit Success Case` (2 modificados, +1 escenario `Add videos and links`); 2 conservados |
| `admin-services-crud` | **Fusionada** | Reemplazados `Create Service` y `Edit Service` (2 modificados, +1 escenario `Add includedItems and technicalExplanation`); 2 conservados |
| `sanitization` | **Fusionada** | Reemplazados los 3 requisitos (allowlist de medios, excepción simulador, admin sin HTML); +3 escenarios nuevos |

**Total**: 5 specs principales creadas, 6 fusionadas, 11 dominios sincronizados. Sin requisitos REMOVED en ningún delta — la fusión no fue destructiva.

## Verificación (puertas)

| Puerta | Resultado |
|--------|-----------|
| Typecheck | ✅ 0 errores en 5 paquetes (shared, api, admin-panel, client-site, recruiter-site) |
| Tests API (Jest) | ✅ 264/264 (21 suites), 0 fallos |
| Cobertura API | ✅ Stmts 85.21 / Branch 72.09 / Funcs 91.5 / Lines 91.55 (umbral ≥70%) |
| Vitest shared | ✅ 106/106 |
| Vitest admin-panel | ✅ 13/13 |
| Vitest client-site | ✅ 18/18 |
| Vitest recruiter-site | ✅ 15/15 |
| Build shared (tsup) | ✅ CJS + ESM + DTS |
| Migraciones Prisma | ✅ 8 migraciones, esquema al día |
| Invariantes de seguridad (fase 4) | ✅ 12/12 PASS (bucket privado, sandbox sin allow-same-origin, CSP, nosniff/no-store, guarda 1MB, restricción de src iframe, 404/soft-delete) |

## Seguimientos abiertos (no implementados)

1. **Escenario preexistente no implementado** (descubierto durante la verificación de P2): `PATCH /api/blog-posts/:id/reorder` (Reordenar posts de blog, protegido) existe en la spec principal `blog-post-api` pero nunca se implementó. Requiere una decisión: implementarlo como cambio de seguimiento o eliminarlo de la spec.
2. **Claves i18n muertas** — `simulators.colTitle`, `simulators.colSlug`, `simulators.colSize`, `simulators.colUploaded` existen en es/en pero no son referenciadas por ningún archivo (restos de un layout de tabla reemplazado por lista). Eliminar o conectar a la lista.
3. **Fallback SSR inerte** — `renderSimulatorEmbeds` devuelve el HTML sanitizado sin transformar cuando `DOMParser` no existe (SSR), dejando placeholders `div[data-simulator-id]` sin transformar. Inofensivo hoy (SPAs renderizadas en cliente); si se introduce SSR, añadir reemplazo regex seguro.
4. **Rama sin probar** — `simulator.service.ts` L71 (`Title is required`) es la única línea sin cubrir (97.82% líneas). Un test de una línea para `upload({ title: '' })` la cerraría.
5. **TagInput** — El límite de etiquetas está fijado a 10 (hardcode) en el componente `TagInput` compartido; podría centralizarse en el schema compartido.
6. **Debounce sin test** — Vitest del cliente no prueba el timing del debounce de 300ms en la búsqueda del blog.
7. **Filtro de tags del reclutador** — Carece de pruebas Vitest dedicadas (verificado por typecheck + manual).

## Observaciones en Engram (trazabilidad)

| Artefacto | ID de observación |
|-----------|-------------------|
| Propuesta | #1008 |
| Spec (deltas, 11 dominios) | #1009 |
| Diseño | #1010 |
| Tareas | #1011 |
| Apply progress (fase 4) | #1012 |
| Resumen apply P1a | #1015 |
| Reporte de verificación (fase 4, final) | #1016 |
| Decisión PR #13 | #1017 |
| Reporte de archivado | *(este reporte — guardado con topic_key `sdd/project-publications/archive-report`)* |

Nota: no se usó un artefacto `sdd/project-publications/state` (no existía `state.yaml` en la carpeta del cambio ni observación de estado en Engram); el DAG de fases se reflejó en `tasks.md` y en los reportes de verificación por fase.

## Fuente de verdad actualizada

Las siguientes specs principales reflejan ahora el comportamiento nuevo:

- `openspec/specs/projects/spec.md`
- `openspec/specs/blog-tags/spec.md`
- `openspec/specs/rich-text-editor/spec.md`
- `openspec/specs/simulator-embeds/spec.md`
- `openspec/specs/upload-hardening/spec.md`
- `openspec/specs/recruiter-projects/spec.md`
- `openspec/specs/blog-filters/spec.md`
- `openspec/specs/blog-post-api/spec.md`
- `openspec/specs/admin-success-cases-crud/spec.md`
- `openspec/specs/admin-services-crud/spec.md`
- `openspec/specs/sanitization/spec.md`

## Ciclo SDD completo

El cambio fue planificado, especificado, diseñado, implementado, verificado y archivado por completo.
Listo para el siguiente cambio.