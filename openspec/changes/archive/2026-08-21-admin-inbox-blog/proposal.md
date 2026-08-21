# Proposal: Admin Inbox + Blog Frontend Filters

## Intent

Rediseñar la bandeja de mensajes del admin tipo Gmail (filtros, búsqueda, archivado, etiquetas) y agregar filtros por categoría + búsqueda en los blogs de Client Site y Recruiter Site.

## Scope

### In Scope
1. **Inbox Gmail-like**: read tracking, archivado, etiquetas, búsqueda, filtros, UI rediseñada
2. **Blog Filters**: búsqueda + filtro por categoría en client-site y recruiter-site
3. **Fix pagination bug**: ContactMessagesList no pasaba filtros a la API

### Out of Scope
- Responder mensajes desde el admin
- Notificaciones en tiempo real
- Tags/labels personalizables por el usuario (sistema fijo)

## Approach

Shared schemas → Prisma migration → API → Admin hooks/components → Frontend blog filters.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/shared/src/schemas/contact.schema.ts` | Modified | +readAt, archived, labels en schema y response |
| `api/prisma/schema.prisma` | Modified | ContactForm: +readAt, archived, labels |
| `api/src/services/contact.service.ts` | Modified | +search, isRead, isArchived, label filters; +markRead, archive, setLabels |
| `api/src/controllers/contact.controller.ts` | Modified | Nuevos handlers |
| `api/src/routes/contact.routes.ts` | Modified | Nuevas rutas |
| `admin-panel/src/api/contactForms.api.ts` | Modified | +search, read, archive, labels |
| `admin-panel/src/hooks/useContactForms.ts` | Modified | Nuevos mutations |
| `admin-panel/src/pages/contact-messages/` | Modified | UI rediseñada tipo Gmail |
| `admin-panel/src/i18n/translations.ts` | Modified | Nuevas traducciones |
| `api/src/services/blog-post.service.ts` | Modified | +search filter |
| `packages/shared/src/schemas/blogPost.schema.ts` | Modified | +search field en filterSchema |
| `client-site/src/hooks/useBlogPosts.ts` | Modified | Aceptar filters + search |
| `client-site/src/pages/Blog/` | Modified | +category filter + search input |
| `recruiter-site/src/hooks/useBlogPosts.ts` | Modified | Aceptar filters + search |
| `recruiter-site/src/pages/BlogPage.tsx` | Modified | +category filter + search input |
| `recruiter-site/src/components/blog/BlogGrid.tsx` | Modified | +filter bar |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|-------------|
| Prisma String[] no soporta ILIKE search | Med | Usar $queryRaw o contains con filtro adicional |
| Labels como String[] en PostgreSQL requiere migración | Low | Prisma maneja arrays nativamente |

## Rollback Plan

1. `git checkout` archivos modificados
2. `prisma db push` con schema anterior

## Success Criteria

- [ ] Tests API pasando
- [ ] TypeScript 0 errores en todos los packages
- [ ] Inbox muestra read/unread correctamente
- [ ] Búsqueda en inbox filtra por nombre/email/mensaje
- [ ] Archivado funciona y persiste en DB
- [ ] Blog de client-site tiene filtro por categoría y búsqueda
- [ ] Blog de recruiter-site tiene filtro por categoría y búsqueda
- [ ] Build exitoso en todos los frontends
