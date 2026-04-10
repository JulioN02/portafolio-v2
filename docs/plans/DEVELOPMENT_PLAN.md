# Portafolio Web v2.0 — Plan de Desarrollo Completo
## Fases, Integraciones, Dependencias y Estrategia

> **Versión**: 1.0 | **Fecha**: Abril 2026
> **Base**: Technical Spec v1.1 + decisiones confirmadas

---

## 1. Mapa de Dependencias del Sistema

```
                    ┌─────────────────────────────────────────┐
                    │           BASE DE DATOS                  │
                    │         PostgreSQL + Prisma               │
                    └──────────────┬──────────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────────┐
                    │          API REST (Express)              │
                    │   Controllers → Services → Prisma        │
                    │   + Zod validation + JWT Auth            │
                    └──┬───────────┬──────────────┬───────────┘
                       │           │              │
              ┌────────▼──┐ ┌─────▼──────┐ ┌─────▼──────┐
              │  Client    │ │ Recruiter  │ │    Admin   │
              │  Site      │ │ Site       │ │   Panel    │
              │  (React)   │ │ (React)    │ │  (React)   │
              └────────────┘ └────────────┘ └────────────┘
```

### Reglas de dependencia:
1. **API es la base de todo** — Ningún frontend puede funcionar sin endpoints
2. **Admin necesita la API completa** — No puede haber admin sin CRUDs
3. **Client Site necesita al menos Services + Contact** — Para ser funcional
4. **Recruiter Site necesita Services + Products + Tools + SuccessCases** — Para la sección de Proyectos
5. **Blog necesita su propio CRUD** — Independiente del resto

---

## 2. Decisiones que DEBEN tomarse ANTES de F0

### 2.1 Gestor de Archivos (Cloudinary vs S3)

**Decisión: Cloudinary** ✅

**Por qué importa antes de F0**:
- El schema de Prisma almacena URLs de imágenes. La estructura de URL cambia según el servicio.
- Cloudinary: `https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}`
- S3: `https://{bucket}.s3.{region}.amazonaws.com/{key}`
- Si decides después, hay que migrar TODAS las URLs almacenadas.

**Implicaciones técnicas**:
- Cloudinary tiene SDK de Node.js (`cloudinary`) con subida directa desde el backend
- Transformaciones on-the-fly via URL params: `/w_400,h_300,c_fill/` — útil para thumbnails en carruseles
- Plan gratuito: 25 GB almacenamiento, 25 GB bandwidth/mes — suficiente para un portafolio
- En desarrollo: Multer guarda local en `api/uploads/`, en producción se usa Cloudinary

**Implementación**:
```
Desarrollo:  Multer → disco local → URL relativa (/uploads/filename.jpg)
Producción:  Multer → Cloudinary SDK → URL completa de Cloudinary
```

### 2.2 Plataforma de Hosting (Railway vs Render)

**Decisión: Railway** ✅

**Por qué importa antes de F0**:
- Las variables de entorno de producción se definen en la plataforma
- Railway ofrece PostgreSQL como servicio integrado — no necesitas configurar DB externa
- El deploy se hace conectando el repo de GitHub — necesitas la estructura del monorepo definida

**Arquitectura de deploy en Railway**:
```
Railway Project: "portafolio-jsoft"
├── Service: "api" (Node.js/Express)
│   ├── DATABASE_URL (auto-provisioned)
│   ├── CLOUDINARY_CLOUD_NAME
│   ├── CLOUDINARY_API_KEY
│   ├── CLOUDINARY_API_SECRET
│   ├── JWT_SECRET
│   ├── NODE_ENV=production
│   └── PORT (auto)
├── Service: "client-site" (Static site)
│   └── VITE_API_URL → URL del servicio api
├── Service: "recruiter-site" (Static site)
│   └── VITE_API_URL → URL del servicio api
└── Service: "admin-panel" (Static site)
    └── VITE_API_URL → URL del servicio api
```

### 2.3 Package Manager

**Decisión: pnpm** ✅

**Por qué importa antes de F0**:
- El archivo `pnpm-workspace.yaml` define la estructura del monorepo
- Los `package.json` de cada workspace usan `workspace:*` para referencias internas
- Si usas npm después, hay que reconfigurar todo

---

## 3. Plan de Fases Detallado

### FASE 0: Foundation (~2 días)

**Objetivo**: Cimientos técnicos. Todo lo que se construya después se apoya aquí.

#### Tareas:

| # | Tarea | Detalle | Prioridad |
|---|---|---|---|
| 0.1 | Inicializar monorepo | `pnpm init`, `pnpm-workspace.yaml`, estructura de carpetas | 🔴 Crítica |
| 0.2 | Configurar `packages/shared` | `package.json`, TypeScript config, exports | 🔴 Crítica |
| 0.3 | Escribir schemas de Zod | Todos los schemas (service, product, tool, successCase, blogPost, contact, login) | 🔴 Crítica |
| 0.4 | Escribir tipos TypeScript compartidos | Interfaces derivadas de los schemas, enums, constantes | 🔴 Crítica |
| 0.5 | Configurar `api/` | Express + TypeScript, tsconfig, scripts, dependencias base | 🔴 Crítica |
| 0.6 | Escribir schema de Prisma | Las 7 entidades con todos los campos, relaciones, índices | 🔴 Crítica |
| 0.7 | Ejecutar migración inicial | `prisma migrate dev`, verificar tablas en PostgreSQL local | 🔴 Crítica |
| 0.8 | Crear usuario admin inicial | Seed script o Prisma Studio para crear el primer user | 🔴 Crítica |
| 0.9 | Módulo de autenticación | POST /auth/login, JWT generation, bcrypt, middleware de verificación | 🔴 Crítica |
| 0.10 | Configurar variables de entorno | `.env.example`, `.env.local`, documentación de vars necesarias | 🟡 Importante |
| 0.11 | Contrato OpenAPI (F0-F1) | Swagger/YAML con endpoints de auth y services | 🟡 Importante |

#### Criterio de salida:
- [ ] Monorepo funcional con workspaces
- [ ] `packages/shared` exporta schemas de Zod y tipos
- [ ] Migraciones corren sin errores en PostgreSQL local
- [ ] `POST /api/auth/login` retorna JWT válido
- [ ] Middleware protege rutas admin (401 sin token, 200 con token)
- [ ] Contrato OpenAPI valida sin errores

#### Riesgos:
- **Schema de Prisma**: Si hay errores en las relaciones o tipos, todas las fases posteriores se bloquean. Verificar con `prisma validate` antes de migrar.
- **OpenAPI**: Escribirlo a mano es propenso a errores. Usar Swagger Editor para validar.

---

### FASE 1: Core API — Servicios y Contacto (~4 días)

**Objetivo**: API funcional para el módulo de mayor valor comercial.

#### Tareas:

| # | Tarea | Detalle | Prioridad |
|---|---|---|---|
| 1.1 | Service layer: Services | `service.service.ts` — CRUD completo con lógica de negocio | 🔴 Crítica |
| 1.2 | Controller layer: Services | `service.controller.ts` — Orquestación, sin lógica de negocio | 🔴 Crítica |
| 1.3 | Routes: Services | `service.routes.ts` — GET, GET/:slug, POST, PUT, DELETE, REORDER | 🔴 Crítica |
| 1.4 | Validación Zod: Services | Middleware que valida request body contra `serviceSchema` | 🔴 Crítica |
| 1.5 | Helper de slug generation | Función que genera slugs únicos desde el título | 🔴 Crítica |
| 1.6 | Helper de paginación | `paginate(model, page, limit)` — reutilizable para todos los CRUDs | 🔴 Crítica |
| 1.7 | Upload de imágenes (Multer) | `POST /api/upload` — almacenamiento local en dev | 🔴 Crítica |
| 1.8 | Service layer: ContactForm | `contact.service.ts` — guardar formulario con source y originType | 🔴 Crítica |
| 1.9 | Controller + Routes: Contact | `POST /api/contact` — validación Zod, guardado | 🔴 Crítica |
| 1.10 | Middleware de error handling | Global error handler, formato consistente de respuestas | 🟡 Importante |
| 1.11 | Tests unitarios: Services | Jest tests para service de Services y ContactForm (cobertura 70%+) | 🟡 Importante |
| 1.12 | Actualizar OpenAPI | Agregar endpoints de services y contact al contrato | 🟡 Importante |

#### Criterio de salida:
- [ ] CRUD de Services funcional (verificado con Postman/Insomnia)
- [ ] `POST /api/contact` guarda con source correcto
- [ ] Upload de imágenes retorna URL accesible
- [ ] Paginación funciona correctamente
- [ ] Tests pasan con cobertura 70%+ en services
- [ ] Validación Zod rechaza datos inválidos

#### Dependencias: F0 completa

---

### FASE 2: Admin MVP + Clientes MVP (~8 días)

**Objetivo**: Primer loop de valor completo. Crear contenido desde admin → visible en página de clientes. **MVP publicable.**

#### Parte A — Admin Panel (~4 días)

| # | Tarea | Detalle | Prioridad |
|---|---|---|---|
| 2A.1 | Configurar `admin-panel/` | Vite + React + TypeScript, routing, estructura | 🔴 Crítica |
| 2A.2 | Configurar CSS Modules | Setup de estilos, variables CSS, resets | 🔴 Crítica |
| 2A.3 | Configurar API client | Servicio HTTP con interceptors (JWT en headers) | 🔴 Crítica |
| 2A.4 | Pantalla de Login | Formulario, validación Zod, almacenamiento JWT, redirect | 🔴 Crítica |
| 2A.5 | Layout del Admin | Sidebar, header, estructura de navegación | 🔴 Crítica |
| 2A.6 | Dashboard | Resumen: conteo de servicios, formularios pendientes | 🟡 Importante |
| 2A.7 | Integrar TipTap | Instalar y configurar TipTap con extensiones básicas | 🔴 Crítica |
| 2A.8 | CRUD Servicios — Listado | Tabla con nombre, clasificación, featured, order, acciones | 🔴 Crítica |
| 2A.9 | CRUD Servicios — Formulario crear/editar | Todos los campos + TipTap para fullDescription + upload imágenes | 🔴 Crítica |
| 2A.10 | CRUD Servicios — Reordenamiento | Flechas arriba/abajo o drag-and-drop | 🟡 Importante |
| 2A.11 | CRUD Servicios — Soft delete | Botón eliminar que setea deletedAt, confirmación | 🟡 Importante |
| 2A.12 | Toggle featured | Checkbox/toggle en el formulario | 🟡 Importante |
| 2A.13 | Bandeja de entrada — Clientes | Listado de formularios con nombre, origen, fecha | 🔴 Crítica |
| 2A.14 | Bandeja — Vista detalle | Modal o página con información completa del formulario | 🟡 Importante |

#### Parte B — Client Site (~4 días)

| # | Tarea | Detalle | Prioridad |
|---|---|---|---|
| 2B.1 | Configurar `client-site/` | Vite + React + TypeScript, routing, estructura | 🔴 Crítica |
| 2B.2 | Configurar CSS Modules | Setup de estilos, variables CSS, responsive base | 🔴 Crítica |
| 2B.3 | Configurar API client | Servicio HTTP para consumo de API pública | 🔴 Crítica |
| 2B.4 | Navegación principal | Header con links a secciones, responsive (hamburger en móvil) | 🔴 Crítica |
| 2B.5 | Hero (Home) | Imagen de portada + nombre + frase (puede ser estático en esta fase) | 🔴 Crítica |
| 2B.6 | About (Home) | Presentación de J Soft Solutions (texto estático inicial) | 🟡 Importante |
| 2B.7 | Servicios Destacados (Home) | `GET /api/services?featured=true&limit=3`, tarjetas | 🔴 Crítica |
| 2B.8 | Página completa de Servicios | Listado con paginación, grid responsive (1 col móvil, 2 col desktop) | 🔴 Crítica |
| 2B.9 | Vista detalle de Servicio | Inline/modal con título, galería, descripción, incluidos | 🔴 Crítica |
| 2B.10 | Formulario de contacto modal | Campos: nombre, apellido, WhatsApp, email, mensaje. Validación Zod. Source automático. | 🔴 Crítica |
| 2B.11 | Sección Contacto General | Formulario con source "general" + redes sociales | 🟡 Importante |
| 2B.12 | Footer | Links, copyright, redes sociales | 🟢 Nice to have |

#### Criterio de salida — MVP PUBLICABLE:
- [ ] Se puede agregar un servicio desde el admin y verlo en la página de clientes
- [ ] El formulario de contacto de un servicio llega a la bandeja del admin con el nombre del servicio como origen
- [ ] La página de clientes carga sin errores en móvil y escritorio
- [ ] El admin protege las rutas con JWT

#### Dependencias: F0 + F1 completas

---

### FASE 3: Expansión API — Products, Tools, SuccessCases (~4 días)

**Objetivo**: Replicar el patrón de Services para el resto de entidades de contenido.

#### Tareas:

| # | Tarea | Detalle | Prioridad |
|---|---|---|---|
| 3.1 | Service layer: Products | CRUD completo con campo externalLink | 🔴 Crítica |
| 3.2 | Controller + Routes: Products | GET, GET/:slug, POST, PUT, DELETE, REORDER | 🔴 Crítica |
| 3.3 | Validación Zod: Products | Middleware con `productSchema` | 🔴 Crítica |
| 3.4 | Service layer: Tools | CRUD completo con campo requiresInstall | 🔴 Crítica |
| 3.5 | Controller + Routes: Tools | GET, GET/:slug, POST, PUT, DELETE, REORDER | 🔴 Crítica |
| 3.6 | Validación Zod: Tools | Middleware con `toolSchema` | 🔴 Crítica |
| 3.7 | Service layer: SuccessCases | CRUD con soporte de múltiples imágenes, videos, links | 🔴 Crítica |
| 3.8 | Controller + Routes: SuccessCases | GET, GET/:slug, POST, PUT, DELETE | 🔴 Crítica |
| 3.9 | Validación Zod: SuccessCases | Middleware con `successCaseSchema` | 🔴 Crítica |
| 3.10 | Endpoint: Projects (agregación) | `GET /api/projects` — une services + products + tools + successCases | 🔴 Crítica |
| 3.11 | Endpoint: Projects Recent | `GET /api/projects/recent` — últimos 3 | 🔴 Crítica |
| 3.12 | Tests unitarios | Tests para los 3 nuevos services | 🟡 Importante |
| 3.13 | Actualizar OpenAPI | Todos los nuevos endpoints | 🟡 Importante |

#### Criterio de salida:
- [ ] 4 módulos (Service, Product, Tool, SuccessCase) con CRUD completo
- [ ] Paginación funciona en todos los listados
- [ ] Endpoint de Projects retorna datos unificados correctamente
- [ ] Tests pasan

#### Dependencias: F0 + F1 completas (F2 puede estar en paralelo)

---

### FASE 4: Clientes Completo (~5 días)

**Objetivo**: Todas las secciones de la página de clientes funcionales.

#### Tareas:

| # | Tarea | Detalle | Prioridad |
|---|---|---|---|
| 4.1 | Carrusel de casos de éxito (Home) | Componente carrusel con imágenes + títulos | 🔴 Crítica |
| 4.2 | Resumen de productos (Home) | Carrusel con hasta 5 productos destacados | 🔴 Crítica |
| 4.3 | Resumen de herramientas (Home) | Carrusel con hasta 3 herramientas destacadas | 🔴 Crítica |
| 4.4 | CTA del Home | Botón "Contactar" → scroll a sección de contacto | 🟡 Importante |
| 4.5 | Página completa de Productos | Catálogo con paginación, grid 2 columnas, vista detalle inline | 🔴 Crítica |
| 4.6 | Formulario contacto producto | Modal con source automático del producto | 🔴 Crítica |
| 4.7 | Página completa de Herramientas | Galería 4 columnas (desktop), 2 (móvil) | 🔴 Crítica |
| 4.8 | Lógica condicional herramientas | Si requiresInstall=false → acceso directo, si=true → formulario | 🔴 Crítica |
| 4.9 | Página completa de Casos de Éxito | Galería listada con imágenes, videos, links | 🔴 Crítica |
| 4.10 | Paginación en todas las secciones | Componente reutilizable de paginación sin recarga | 🔴 Crítica |
| 4.11 | Admin: CRUD Productos | Listado + formulario con TipTap + upload + externalLink | 🔴 Crítica |
| 4.12 | Admin: CRUD Herramientas | Listado + formulario con TipTap + toggle requiresInstall | 🔴 Crítica |
| 4.13 | Admin: CRUD Casos de Éxito | Listado + formulario con upload múltiple (imágenes + videos) | 🔴 Crítica |
| 4.14 | Admin: Reordenamiento Products/Tools | Flechas arriba/abajo | 🟡 Importante |

#### Criterio de salida:
- [ ] Todas las secciones de la página de clientes consumen datos reales de la API
- [ ] Formularios de todas las secciones llegan a la bandeja del admin con source correcto
- [ ] Paginación funciona sin recargar página
- [ ] Herramientas gratuitas muestran acceso directo, las de implementación muestran formulario

#### Dependencias: F2 + F3 completas

---

### FASE 5: Página de Reclutadores (~6 días)

**Objetivo**: Segunda superficie pública completamente funcional.

#### Tareas:

| # | Tarea | Detalle | Prioridad |
|---|---|---|---|
| 5.1 | Configurar `recruiter-site/` | Vite + React + TypeScript, routing, estructura | 🔴 Crítica |
| 5.2 | Configurar CSS Modules | Setup de estilos (puede compartir base con client-site) | 🔴 Crítica |
| 5.3 | Configurar API client | Servicio HTTP para consumo de API | 🔴 Crítica |
| 5.4 | Navegación principal | Header con links a secciones, responsive | 🔴 Crítica |
| 5.5 | Hero personal | Foto, nombre, profesión, frase (estático o configurable) | 🔴 Crítica |
| 5.6 | Toggle Perfil Profesional/Técnico | Botón que alterna entre dos textos sin recarga | 🔴 Crítica |
| 5.7 | Carrusel de Stack | Automático, 3 grupos (Front, Back, Complementarias). Datos estáticos JSON | 🔴 Crítica |
| 5.8 | Carrusel de Proyectos Recientes | Últimos 3 proyectos de la API | 🔴 Crítica |
| 5.9 | CTA Reclutadores | Botón → sección de contacto | 🟡 Importante |
| 5.10 | Sección Proyectos completa | Listado unificado con clasificación, paginación | 🔴 Crítica |
| 5.11 | Card modal de detalle de proyecto | Galería multimedia + explicación técnica extendida | 🔴 Crítica |
| 5.12 | Blog — Lectura pública | Cuadrícula 3 columnas, solo posts con status=PUBLISHED | 🔴 Crítica |
| 5.13 | Blog — Página individual de post | Imagen, título, categoría, carrusel, cuerpo, link GitHub, lecciones | 🔴 Crítica |
| 5.14 | Contacto Reclutadores | Formulario con source "recruiter" | 🔴 Crítica |
| 5.15 | Redes sociales profesionales | WhatsApp, LinkedIn, GitHub, correo | 🟡 Importante |
| 5.16 | Footer | Links, copyright | 🟢 Nice to have |

#### Criterio de salida:
- [ ] Página de reclutadores completamente funcional con datos reales de la API
- [ ] Proyectos muestran información técnica extendida correctamente
- [ ] Blog muestra solo publicaciones con status "published"
- [ ] Formulario de reclutadores llega a bandeja separada en admin

#### Dependencias: F0 + F3 completas (F4 puede estar en paralelo)

---

### FASE 6: Admin Completo — Blog y Gestión Avanzada (~4 días)

**Objetivo**: Cerrar todos los módulos de administración pendientes.

#### Tareas:

| # | Tarea | Detalle | Prioridad |
|---|---|---|---|
| 6.1 | API: CRUD Blog (write) | POST, PUT, DELETE /posts con gestión de estado | 🔴 Crítica |
| 6.2 | API: Cambiar estado del post | `PUT /api/posts/:id/status` — published/private/archived | 🔴 Crítica |
| 6.3 | API: Validación Zod Blog | Middleware con `blogPostSchema` | 🔴 Crítica |
| 6.4 | Admin: CRUD Blog — Listado | Tabla filtrable por nombre, fecha, estado | 🔴 Crítica |
| 6.5 | Admin: CRUD Blog — Formulario | TipTap para body + lessonsLearned, upload galería, todos los campos | 🔴 Crítica |
| 6.6 | Admin: Cambio de estado inline | Dropdown o toggle en el listado para cambiar estado sin abrir formulario | 🟡 Importante |
| 6.7 | Admin: Bandeja Reclutadores | Listado independiente de formularios con source "recruiter" | 🔴 Crítica |
| 6.8 | Admin: CRUD Products | (Si no se hizo en F4) Listado + formulario | 🔴 Crítica |
| 6.9 | Admin: CRUD Tools | (Si no se hizo en F4) Listado + formulario | 🔴 Crítica |
| 6.10 | Admin: CRUD SuccessCases | (Si no se hizo en F4) Listado + formulario | 🔴 Crítica |
| 6.11 | Admin: Revisión de consistencia | Unificar estilos, comportamientos, mensajes de error en todos los módulos | 🟡 Importante |

#### Criterio de salida:
- [ ] Se puede crear, editar, publicar y archivar un blog post desde el admin
- [ ] El blog post se refleja en la página de reclutadores según su estado
- [ ] Formularios de reclutadores llegan a bandeja específica sin mezclarse con clientes
- [ ] Todos los módulos del admin son consistentes visual y funcionalmente

#### Dependencias: F5 (necesita blog en reclutadores) + F4 (necesita CRUDs de products/tools/successcases)

---

### FASE 7: Polish — Calidad, Performance y Accesibilidad (~3 días)

**Objetivo**: Llevar el sistema al estándar de calidad mínimo para publicación.

#### Tareas:

| # | Tarea | Detalle | Prioridad |
|---|---|---|---|
| 7.1 | Responsive design — Client Site | Revisión en 375px, 768px, 1440px. Corrección de breakpoints | 🔴 Crítica |
| 7.2 | Responsive design — Recruiter Site | Revisión en 375px, 768px, 1440px. Corrección de breakpoints | 🔴 Crítica |
| 7.3 | Responsive design — Admin Panel | Revisión en 768px, 1440px | 🟡 Importante |
| 7.4 | SEO básico — Client Site | Meta tags (title, description), Open Graph por sección | 🔴 Crítica |
| 7.5 | SEO básico — Recruiter Site | Meta tags, Open Graph por sección | 🔴 Crítica |
| 7.6 | Performance — Optimización de imágenes | Lazy loading, compresión, srcset para diferentes tamaños | 🔴 Crítica |
| 7.7 | Performance — Lighthouse | Objetivo: Performance > 85, Accesibilidad > 90 | 🔴 Crítica |
| 7.8 | Manejo de errores en frontend | Estados de carga (skeletons/spinners), estados vacíos, errores de red | 🔴 Crítica |
| 7.9 | Seguridad — Revisión OWASP Top 10 | Endpoints expuestos, rutas admin protegidas, sanitización de inputs | 🔴 Crítica |
| 7.10 | Sanitización de Rich Text HTML | Sanitizar HTML de TipTap antes de renderizar (evitar XSS) | 🔴 Crítica |
| 7.11 | Cero errores en consola | Revisión en producción, eliminar warnings | 🟡 Importante |
| 7.12 | Documentación final | README del proyecto, instrucciones de deploy, variables de entorno | 🟡 Importante |

#### Criterio de salida:
- [ ] Lighthouse Accesibilidad > 90 en ambas páginas públicas
- [ ] Lighthouse Performance > 85 en ambas páginas públicas
- [ ] 0 errores críticos en consola del navegador
- [ ] Sistema funcional en 375px, 768px y 1440px
- [ ] Revisión OWASP Top 10 completada sin vulnerabilidades críticas
- [ ] HTML de TipTap sanitizado correctamente

#### Dependencias: Todas las fases anteriores completas

---

## 4. Integraciones Externas

### 4.1 Cloudinary (Gestión de Archivos)

```
Cuándo: F1 (upload básico) → F7 (producción)
Dependencias: Ninguna para dev, F0 para prod vars

Flujo de subida:
1. Admin sube archivo → POST /api/upload (multipart/form-data)
2. Multer recibe el archivo en memoria
3. En dev: guarda en api/uploads/ → retorna URL relativa
4. En prod: Cloudinary SDK upload → retorna URL completa de Cloudinary
5. Frontend usa la URL retornada

Endpoints:
- POST /api/upload          → Subir archivo (admin, auth required)
- DELETE /api/upload/:id    → Eliminar archivo (admin, auth required)
```

**Variables de entorno necesarias**:
```bash
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

### 4.2 PostgreSQL (Base de Datos)

```
Cuándo: F0 (local) → F7 (producción en Railway)
Dependencias: Ninguna

Desarrollo:
- PostgreSQL local (Docker o instalación nativa)
- DATABASE_URL=postgresql://user:password@localhost:5432/portafolio_v2

Producción (Railway):
- PostgreSQL provisionado automáticamente por Railway
- DATABASE_URL inyectado como variable de entorno
```

### 4.3 JWT (Autenticación)

```
Cuándo: F0
Dependencias: Ninguna

Flujo:
1. Admin envía username + password → POST /api/auth/login
2. Backend verifica con bcrypt
3. Si válido → genera JWT con { userId, username, role }
4. Frontend guarda JWT en localStorage
5. Cada request al admin incluye: Authorization: Bearer <token>
6. Middleware verifica token antes de cada ruta protegida
```

**Variables de entorno necesarias**:
```bash
JWT_SECRET=xxx (mínimo 32 caracteres, generar con crypto.randomBytes)
JWT_EXPIRES_IN=7d
```

### 4.4 Railway (Deploy)

```
Cuándo: F7 (o antes si se quiere hacer deploy incremental)
Dependencias: F0 (para vars de entorno), F2 (para primer deploy funcional)

Estructura:
- 4 servicios en Railway (api, client-site, recruiter-site, admin-panel)
- API: Node.js/Express con PostgreSQL integrado
- Frontends: Static sites (build con Vite)
- Todos los frontends apuntan a la URL de la API via VITE_API_URL
```

---

## 5. Matriz de Riesgos

| # | Riesgo | Impacto | Probabilidad | Mitigación |
|---|---|---|---|---|
| R1 | Schema de Prisma con errores | 🔴 Alto | Media | Validar con `prisma validate` antes de migrar. Crear migración inicial pequeña y verificar. |
| R2 | TipTap genera HTML malicioso (XSS) | 🔴 Alto | Baja | Sanitizar con `dompurify` o `sanitize-html` antes de renderizar en frontend. |
| R3 | Cloudinary free tier se queda corto | 🟡 Medio | Baja | 25GB es mucho para un portafolio. Monitorear uso. Fallback: comprimir imágenes antes de subir. |
| R4 | Paginación del lado del cliente no escala | 🟡 Medio | Baja | Si hay 100+ items, considerar paginación del lado del servidor con cursor. |
| R5 | Monorepo con workspaces da problemas de build | 🟡 Medio | Media | Usar pnpm (más estable con workspaces que npm). Testear build completo antes de avanzar. |
| R6 | Validación Zod en frontend y backend se desincroniza | 🟡 Medio | Media | Usar paquete `shared` como única fuente de verdad. Si un schema cambia, ambos lados se actualizan. |
| R7 | Soft delete rompe queries si se olvida el filtro | 🟡 Medio | Alta | Crear un middleware de Prisma o helper que siempre filtre `deletedAt IS NULL`. |
| R8 | Slug collisions | 🟡 Medio | Baja | Agregar sufijo numérico auto-incremental si el slug ya existe. |
| R9 | CORS entre frontends y API | 🟢 Bajo | Alta | Configurar CORS en Express con lista blanca de dominios. En dev: `*`. |

---

## 6. Orden de Ejecución Óptimo

```
F0 (Foundation)
  │
  ├──→ F1 (Core API: Services + Contact)
  │      │
  │      └──→ F2 (Admin MVP + Clientes MVP)
  │                   │
  │                   └──→ F4 (Clientes Completo)
  │
  └──→ F3 (Expansión API: Products, Tools, SuccessCases)
           │
           ├──→ F4 (Clientes Completo) ← depende de F2 + F3
           │
           └──→ F5 (Reclutadores) ← depende de F0 + F3
                    │
                    └──→ F6 (Admin Completo) ← depende de F4 + F5
                              │
                              └──→ F7 (Polish) ← depende de todo
```

**Paralelismo posible**:
- F3 puede empezar cuando F1 termina (no necesita F2)
- F5 puede empezar cuando F3 termina (no necesita F4)
- F2 y F3 pueden correr en paralelo si hay tiempo

**Secuencia obligatoria**:
- F0 → F1 → F2 → F4 → F7
- F0 → F3 → F5 → F6 → F7

---

## 7. Checklist de Pre-Desarrollo

Antes de escribir la primera línea de código:

- [ ] **Cloudinary**: Crear cuenta, obtener cloud_name, api_key, api_secret
- [ ] **Railway**: Crear cuenta (opcional, se puede hacer después)
- [ ] **pnpm**: Instalar globalmente (`npm i -g pnpm`)
- [ ] **PostgreSQL**: Instalar localmente o tener Docker con PostgreSQL
- [ ] **Node.js**: Versión 20+ LTS instalada
- [ ] **Git**: Repo inicializado, rama main creada
- [ ] **Editor**: VS Code con extensiones (ESLint, Prettier, Prisma, Tailwind CSS si aplica)
- [ ] **Postman/Insomnia**: Para testing de API
- [ ] **Variables de entorno**: Crear `.env.local` con DATABASE_URL, JWT_SECRET

---

## 8. Resumen de Tecnologías por Capa

### Backend (api/)
| Tecnología | Versión | Propósito |
|---|---|---|
| Node.js | 20+ LTS | Runtime |
| Express | 4.x / 5.x | Framework HTTP |
| TypeScript | 5.x | Type safety |
| Prisma | 5.x | ORM |
| PostgreSQL | 15+ | Base de datos |
| Zod | 3.x | Validación |
| JWT (jsonwebtoken) | 9.x | Autenticación |
| bcrypt | 5.x | Hash de contraseñas |
| Multer | 1.x | Upload de archivos |
| Cloudinary | 1.x | Storage en producción |
| Jest | 29.x | Testing |
| cors, helmet, morgan | latest | Seguridad y logging |

### Frontend (client-site, recruiter-site, admin-panel)
| Tecnología | Versión | Propósito |
|---|---|---|
| React | 19.x | UI Library |
| Vite | 5.x | Build tool + dev server |
| TypeScript | 5.x | Type safety |
| CSS Modules | nativo | Estilos scoped |
| React Router | 6.x | Routing |
| Zod | 3.x | Validación de formularios |
| TipTap | 2.x | Rich text editor (solo admin) |
| React Query (TanStack) | 5.x | Data fetching + caching |

### Shared (packages/shared)
| Tecnología | Versión | Propósito |
|---|---|---|
| Zod | 3.x | Schemas de validación compartidos |
| TypeScript | 5.x | Tipos compartidos |

---

## 9. Estimación Total

| Fase | Días | Dependencias | Entregable Clave |
|---|---|---|---|
| F0 — Foundation | ~2 | Ninguna | Schema + OpenAPI + Auth |
| F1 — Core API | ~4 | F0 | CRUD Services + Contact |
| F2 — Admin MVP + Clientes MVP | ~8 | F0, F1 | **MVP publicable** |
| F3 — Expansión API | ~4 | F0, F1 | CRUD Products, Tools, SuccessCases |
| F4 — Clientes Completo | ~5 | F2, F3 | Todas las secciones de clientes |
| F5 — Reclutadores | ~6 | F0, F3 | Página de reclutadores + Blog |
| F6 — Admin Completo | ~4 | F4, F5 | Blog CRUD + Bandeja reclutadores |
| F7 — Polish | ~3 | Todas | Responsive + SEO + Performance |
| **TOTAL** | **~36 días** | | **Portafolio v2.0 completo** |

> Los días son jornadas efectivas de trabajo como desarrollador único. No representan días calendario.
