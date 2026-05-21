# J Soft Solutions — Portafolio Web v2.0

Portafolio web profesional con **tres superficies públicas** (clientes y reclutadores) y un **panel administrativo** completo. Monorepo con pnpm workspaces, API REST con Express/Prisma/PostgreSQL y frontends en React 19 + Vite.

---

## 🚀 Enlaces de Acceso (Desarrollo Local)

| App | Puerto | URL |
|-----|--------|-----|
| **API REST** | `:3000` | http://localhost:3000 |
| **Client Site** (público clientes) | `:5173` | http://localhost:5173 |
| **Recruiter Site** (público reclutadores) | `:5174` | http://localhost:5174 |
| **Admin Panel** (back-office) | `:5175` | http://localhost:5175 |

### Credenciales de Admin

| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Contraseña | `admin123` |
| URL login | http://localhost:5175/login |

---

## 🏗️ Arquitectura

```
portafolio-v2/
├── api/                          # Express REST API (:3000)
│   ├── prisma/                   # Schema + migraciones + seed
│   └── src/
│       ├── controllers/          # 9 controladores
│       ├── services/             # 7 servicios con lógica de negocio
│       ├── routes/               # 9 grupos de rutas (~62 endpoints)
│       ├── middleware/           # Auth, validación Zod, error handling
│       └── __tests__/           # Tests con Jest
├── client-site/                  # SPA pública para clientes (:5173)
│   └── src/pages/               # Home, Services, Products, Tools, SuccessCases, Contact, Blog
├── recruiter-site/               # SPA pública para reclutadores (:5174)
│   └── src/pages/               # Home, Projects, Blog, BlogPost, Contact, NotFound
├── admin-panel/                  # Panel administrativo (:5175)
│   └── src/pages/               # Dashboard, CRUDs (5 entidades), Inbox, Settings
├── packages/
│   └── shared/                   # @jsoft/shared — Tipos, Zod schemas, API client, ErrorBoundary
├── docs/
│   ├── plans/                    # Plan de desarrollo completo (F0-F7)
│   ├── specs/                    # Especificaciones técnicas
│   └── analysis/                 # Análisis de arquitectura del sistema
├── openspec/                     # Artefactos SDD (Spec-Driven Development)
│   ├── config.yaml              # Configuración del proyecto
│   ├── specs/                   # Especificaciones por dominio
│   └── changes/                 # Cambios activos y archivados
└── docker-compose.yml           # PostgreSQL 15 (puerto 5434)
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Runtime** | Node.js | 20+ LTS |
| **Package Manager** | pnpm | 9.x |
| **Base de Datos** | PostgreSQL + Prisma ORM | 15 / 5.x |
| **API** | Express + TypeScript | 4.21 / 5.x |
| **Autenticación** | JWT + bcrypt | — |
| **Validación** | Zod | 3.x |
| **Frontends** | React + Vite + TypeScript | 19 / 6 / 5 |
| **Routing** | React Router | 7.x |
| **Data Fetching** | TanStack Query | 5.x |
| **Estilos** | CSS Modules | — |
| **Editor Rich Text** | TipTap (admin) | 2.x |
| **Sanitización HTML** | DOMPurify | 3.x |
| **SEO** | react-helmet-async | 2.x |
| **Testing** | Jest (API) | 30.x |

---

## 📋 Estado del Proyecto (SDD)

### Cambios Completados ✅

| Cambio | Estado | Fases |
|--------|--------|-------|
| **implement-admin-panel** | ✅ Archivado | F1-F13 (CRUDs, Dashboard, Inbox, Settings, Login) |
| **implement-recruiter-site** | ✅ Archivado | 7 fases, 33 tareas, 23/23 escenarios, 0 errores TS |
| **polish-2 (Phase 1)** | ✅ En progreso | Foundation: ErrorBoundary + Sanitización + Deps |

### Próximos Pasos

- **Polish 2 Phase 2**: SEO (13 páginas) + Lazy Loading (React.lazy)
- **Polish 2 Phase 3**: Consola limpia + Responsive refinements
- **Polish 3**: Cloudinary, Railway deploy, Docker

### Funcionalidades Implementadas

#### Panel Admin
- ✅ Autenticación JWT (login/logout)
- ✅ Dashboard con métricas
- ✅ CRUD completo: Services, Products, Tools, SuccessCases, BlogPosts
- ✅ Editor TipTap con rich text
- ✅ Soft delete + featured toggle
- ✅ Drag-to-reorder (Services)
- ✅ Bandeja de entrada (Clientes + Reclutadores)
- ✅ Settings (perfil, password)

#### Client Site
- ✅ Home con carruseles destacados
- ✅ Servicios con detalle y galería
- ✅ Productos con catálogo
- ✅ Herramientas con lógica condicional
- ✅ Casos de Éxito con multimedia
- ✅ Formularios de contacto con source automático
- ✅ Blog (lectura pública)

#### Recruiter Site
- ✅ Home con Hero, ProfileToggle, TechStack carousel
- ✅ Proyectos unificados con filtros tipo + clasificación
- ✅ Modal de detalle con DOMPurify
- ✅ Blog con paginación (solo PUBLISHED)
- ✅ Formulario de contacto reclutadores
- ✅ ErrorBoundary en todas las rutas

---

## 🚀 Inicio Rápido

### Requisitos

- **Node.js** 20+ LTS
- **pnpm** 9+ (`npm i -g pnpm`)
- **Docker** (para PostgreSQL)
- **Git**

### 1. Clonar e instalar

```bash
git clone git@github.com:JulioN02/portafolio-v2.git
cd portafolio-v2
pnpm install
```

### 2. Base de datos

```bash
# Iniciar PostgreSQL con Docker
docker compose up -d

# Ejecutar migraciones
pnpm --filter api exec prisma migrate dev

# (Opcional) Cargar datos de prueba
pnpm --filter api exec tsx prisma/seed-full.ts
```

### 3. Variables de entorno

```bash
cp api/.env.example api/.env.local
# Editar .env.local con:
# DATABASE_URL=postgresql://julion:julion123@localhost:5434/portafolio_v2
# JWT_SECRET=your-secret-key-min-32-chars
# JWT_EXPIRES_IN=7d
```

### 4. Iniciar servicios

```bash
# Terminal 1 - API
pnpm --filter api dev

# Terminal 2 - Client Site
pnpm --filter client-site dev

# Terminal 3 - Admin Panel
pnpm --filter admin-panel dev

# Terminal 4 - Recruiter Site
pnpm --filter recruiter-site dev
```

### O todo en paralelo:

```bash
pnpm dev
```

---

## 🗄️ Base de Datos

- **Imagen Docker**: `postgres:15-alpine`
- **Puerto**: `5434` (host) → `5432` (container)
- **Usuario**: `julion`
- **Contraseña**: `julion123`
- **Base de datos**: `portafolio_v2`
- **Nombre contenedor**: `portafolio-postgres`

### Seed Data

```bash
pnpm --filter api exec tsx prisma/seed-full.ts
```

Carga: 6 servicios, 3 productos, 3 herramientas, 3 casos de éxito, 3 posts de blog, 2 formularios de contacto.

---

## 🧪 Testing

```bash
# Tests de API (Jest)
pnpm --filter api test
# o con coverage
pnpm --filter api test -- --coverage
```

**Nota**: Los frontends no tienen infraestructura de testing actualmente.

---

## 📖 Documentación

- **Plan de desarrollo**: `docs/plans/DEVELOPMENT_PLAN.md`
- **Especificaciones técnicas**: `docs/specs/TECHNICAL_SPEC_UPDATED.md`
- **Arquitectura del sistema**: `docs/analysis/SYSTEM_ARCHITECTURE.md`
- **Artefactos SDD**: `openspec/changes/` (activos y archivados)

---

## 🌐 GitHub Pages (Deploy)

Para desplegar en GitHub Pages, cada frontend necesita su propio workflow:

### Requisitos
1. El API debe estar desplegada en Railway (o similar) para que los frontends tengan datos
2. Cada frontend Vite necesita configurar `base` en `vite.config.ts`
3. Los frontends sin API funcional mostrarán solo estados de carga/vacío

### Pasos rápidos (Recruiter Site como portfolio estático)

```bash
# 1. Configurar base path en vite.config.ts
# Agregar: base: '/portafolio-v2/' (o el nombre del repo)

# 2. Build
pnpm --filter recruiter-site build

# 3. El output está en recruiter-site/dist/
```

---

## 🔑 Variables de Entorno (API)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://user:pass@localhost:5434/portafolio_v2` |
| `JWT_SECRET` | Clave secreta JWT (32+ chars) | `generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `NODE_ENV` | Entorno | `development` / `production` |
| `PORT` | Puerto del servidor | `3000` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary (producción) | — |
| `CLOUDINARY_API_KEY` | Cloudinary (producción) | — |
| `CLOUDINARY_API_SECRET` | Cloudinary (producción) | — |

---

## 📝 Licencia

Privado — J Soft Solutions © 2026
