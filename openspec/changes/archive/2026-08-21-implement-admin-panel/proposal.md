# Proposal: Implement Admin Panel

## Intent

Crear un panel de administración completo para PortafolioV2JSS que permita gestionar contenido (Services, Products, Tools, SuccessCases, BlogPosts) y revisar contactos. El admin-panel está vacío y la API ya está implementada con 25+ endpoints.

## Scope

### In Scope
- Implementar BlogPost API routes (faltantes en backend)
- 11 páginas mínimas: Login, Dashboard, Services(3), Products(3), Tools(3), SuccessCases(3), ContactForms(1)
- Dashboard con sidebar + header (DashboardLayout)
- Autenticación JWT con localStorage + ProtectedRoute
- CRUD completo para: Services, Products, Tools, SuccessCases, BlogPosts
- Lista de ContactForms (solo lectura)
- Reutilizar 7 componentes UI de @jsoft/shared
- Implementar hooks personalizados con TanStack Query

### Out of Scope
- Projects CRUD (mantener solo público por ahora)
- HTTP-only cookies para JWT (usar localStorage)
- Tests E2E (solo implementación inicial)
- Deploy del admin-panel

## Capabilities

### New Capabilities
- `admin-auth`: Login/logout con JWT, ProtectedRoute, manejo de 401
- `admin-dashboard`: Layout con sidebar + header, navegación principal
- `admin-services-crud`: Listar, crear, editar, eliminar servicios
- `admin-products-crud`: Listar, crear, editar, eliminar productos
- `admin-tools-crud`: Listar, crear, editar, eliminar herramientas
- `admin-success-cases-crud`: Listar, crear, editar, eliminar casos de éxito
- `admin-blog-posts-crud`: Listar, crear, editar, eliminar posts del blog (incluye API)
- `admin-contact-forms`: Listar formularios de contacto recibidos

### Modified Capabilities
- `blog-post-api`: Agregar endpoints CRUD faltantes en backend (POST, PUT, DELETE, GET by ID)

## Approach

Seguir patrón de `client-site`: estructura modular con `pages/`, `components/`, `hooks/`, `api/`. Usar React 19 (sin useMemo/useCallback), React Router v7 para routing, TanStack Query para data fetching, Zod para validación. TipTap para editor de BlogPosts. Implementar primero la API de BlogPost en el backend, luego admin-panel frontend.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `admin-panel/src/` | New | Todas las páginas y componentes del admin-panel |
| `server/routes/blog-post.ts` | New | API routes faltantes para BlogPost |
| `shared/src/schemas/` | Reuse | Schemas Zod ya existen, reutilizar |
| `shared/src/components/` | Reuse | 7 componentes UI disponibles |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| BlogPost API no existe | High | Incluir implementación de API como parte del cambio |
| JWT token expiration | Medium | Interceptor en API client para 401 → logout + redirect |
| Esfuerzo elevado (~15-20 páginas) | Medium | Seguir patrón consistente, reutilizar componentes shared |
| TipTap editor complejidad | Low | Usar starter-kit básico inicialmente |

## Rollback Plan

1. Eliminar directorio `admin-panel/src/` (remover código nuevo)
2. Revertir cambios en `server/routes/blog-post.ts` (si se implementó)
3. `git checkout -- admin-panel/` para restaurar estado vacío original

## Dependencies

- API server ya implementada y funcional
- @jsoft/shared con componentes y schemas
- TipTap para editor de BlogPosts
- TanStack Query para estado del servidor

## Success Criteria

- [ ] Login funcional con JWT guardado en localStorage
- [ ] Dashboard accesible solo con auth válida
- [ ] CRUD completo para Services, Products, Tools, SuccessCases, BlogPosts
- [ ] Lista de ContactForms visible
- [ ] ProtectedRoute bloquea rutas sin auth
- [ ] Manejo de 401 redirige a login
