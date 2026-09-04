# J Soft Solutions — Portafolio Web v2.0

Portafolio web profesional con **dos superficies públicas** (clientes y reclutadores) y un **panel administrativo** completo. Monorepo pnpm con una **API REST** (Express/Prisma/PostgreSQL), **3 frontends** (React 19 + Vite) y un paquete **compartido**.

- **Entorno de producción**: Vercel (4 proyectos estáticos) + **Supabase** (PostgreSQL + Storage).
- **Monorepo**: 4 paquetes desplegables (`api`, `client-site`, `recruiter-site`, `admin-panel`) + `packages/shared` (`@jsoft/shared`).

---

## 🚀 Enlaces de Acceso (Desarrollo Local)

| App | Puerto | URL |
|-----|--------|-----|
| **API REST** | `:3000` | http://localhost:3000 |
| **Health check** | `:3000` | http://localhost:3000/api/health |
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

## 🏗️ Arquitectura (Monorepo)

```
portafolio-v2/
├── api/                          # @jsoft/api — Express REST API (:3000)
│   ├── prisma/                   # schema.prisma + migraciones + seeds (seed.ts, seed-full.ts)
│   └── src/
│       ├── controllers/          # 10 controladores
│       ├── services/             # 12 servicios con lógica de negocio
│       ├── routes/               # 10 grupos de rutas (~76 API routes)
│       ├── middleware/           # Auth JWT, validación Zod, error handling
│       └── __tests__/            # Tests con Jest (~99 tests)
├── client-site/                  # @jsoft/client-site — SPA pública para clientes (:5173)
├── recruiter-site/               # @jsoft/recruiter-site — SPA pública para reclutadores (:5174)
├── admin-panel/                  # @jsoft/admin-panel — panel administrativo (:5175)
├── packages/
│   └── shared/                   # @jsoft/shared — Tipos, Zod schemas, API client, UI components
├── docs/                         # Planes, specs, análisis y workflows (referencia)
├── openspec/                     # Artefactos SDD (Spec-Driven Development) — planificación activa
│   ├── config.yaml               # Configuración del proyecto
│   ├── specs/                    # Especificaciones por dominio
│   └── changes/                  # Cambios activos y archivados
├── vercel.json                   # Configuración del build de la API en Vercel (bundle api/build/index.cjs)
├── docker-compose.yml            # PostgreSQL 15 (puerto 5434) — OPCIONAL, solo local
└── .github/workflows/            # ci.yml (CI) + deploy.yml (placeholder intencional) + build-api-bundle.yml (bundle API)
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Runtime** | Node.js | 20+ LTS |
| **Package Manager** | pnpm | 9.x |
| **Base de Datos** | PostgreSQL (Supabase) + Prisma ORM | 15 / 6.3 |
| **API** | Express + TypeScript | 4.21 / 5.x |
| **Autenticación** | JWT + bcrypt | — |
| **Validación** | Zod | 3.x |
| **Storage** | Supabase Storage (bucket público `general`) | — |
| **Frontends** | React + Vite + TypeScript | 19 / 6 / 5 |
| **Routing** | React Router | 7.x |
| **Data Fetching** | TanStack Query | 5.x |
| **Estilos** | CSS Modules | — |
| **Editor Rich Text** | TipTap (admin) | 2.x |
| **Sanitización HTML** | DOMPurify | 3.x |
| **SEO** | react-helmet-async | 2.x |
| **Testing** | Jest (API) · Vitest (frontends + shared) | 30.x / 4.x |

---

## 📋 Estado del Proyecto (SDD)

La **planificación activa** vive en `openspec/` en formato SDD (Spec-Driven Development): `openspec/specs/` (especificaciones por dominio) y `openspec/changes/` (cambios activos) y `openspec/changes/archive/` (cambios archivados).

### Funcionalidades Implementadas ✅

#### Panel Admin
- ✅ Autenticación JWT (login/logout)
- ✅ Dashboard con métricas
- ✅ CRUD completo: Services, Products, Tools, SuccessCases, BlogPosts
- ✅ Editor TipTap con rich text
- ✅ Soft delete + featured toggle + estados de publicación (DRAFT/PUBLISHED/PRIVATE/ARCHIVED)
- ✅ Reorder de secciones del home (SiteSections) + reorder de BlogPosts
- ✅ Bandeja de entrada (Clientes + Reclutadores)
- ✅ Settings (perfil, password)

#### Client Site
- ✅ Home con carruseles destacados
- ✅ Servicios con detalle y galería
- ✅ Productos con catálogo
- ✅ Herramientas con lógica condicional (`requiresInstall`)
- ✅ Casos de Éxito con multimedia
- ✅ Formularios de contacto con source automático
- ✅ Blog (lectura pública) con carrusel de imágenes unificado (portada + galería, autoplay pausable) y lightbox para imágenes, videos y simuladores

#### Recruiter Site
- ✅ Home con Hero, ProfileToggle, TechStack carousel
- ✅ Proyectos unificados con filtros tipo + clasificación
- ✅ Modal de detalle con DOMPurify
- ✅ Blog con paginación (solo PUBLISHED), carrusel de imágenes y lightbox compartidos con client-site
- ✅ Formulario de contacto reclutadores
- ✅ ErrorBoundary en todas las rutas

---

## 🚀 Inicio Rápido

### Requisitos

- **Node.js** 20+ LTS
- **pnpm** 9+ (`npm i -g pnpm`)
- **Git**
- Una cuenta de **Supabase** (proyecto con PostgreSQL + Storage) — opcional para desarrollo local puro

### 1. Clonar e instalar

```bash
git clone git@github.com:JulioN02/portafolio-v2.git
cd portafolio-v2
pnpm install   # el postinstall ejecuta `prisma generate`
```

### 2. Variables de entorno

```bash
# API: revisa el .env.example, luego crea tu archivo real (no se commitea):
cp api/.env.example api/.env
```

Los frontends **no requieren** `.env` en local: su valor por defecto `VITE_API_URL="/api"` usa el proxy del dev server hacia la API en `:3000`. Los `.env.example` de los frontends documentan el valor de producción.

### 3. Base de datos

La base de datos primaria es **Supabase PostgreSQL**. `DATABASE_URL` usa el **transaction pooler** (puerto `6543`, `?pgbouncer=true`) y `DIRECT_URL` la conexión **session mode** (puerto `5432`, requerida por el Prisma CLI).

```bash
# Aplicar migraciones
pnpm --filter api exec prisma migrate deploy

# Cargar datos de prueba
pnpm --filter api db:seed                      # seed.ts (datos base)
# o datos completos:
pnpm --filter api exec tsx prisma/seed-full.ts # seed-full.ts (6 servicios, 3 productos, …)
```

> **Docker (opcional)**: `docker-compose.yml` levanta `postgres:15-alpine` en el puerto `5434` para flujos 100% locales. Ya **no** es la base primaria — Supabase lo es. Solo úsalo si quieres desarrollo local sin Supabase.

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

## 🔑 Variables de Entorno

### API (`api/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase **transaction pooler** (puerto `6543`, `?pgbouncer=true`) — usada por la API en runtime | `postgresql://postgres.<ref>:<pass>@<region>.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase **session mode** (puerto `5432`) para el **Prisma CLI** (migraciones/generate). **REQUERIDA** por `schema.prisma` | `postgresql://postgres.<ref>:<pass>@<region>.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | Clave secreta JWT (32+ chars) | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `SUPABASE_PROJECT_ID` | ID del proyecto Supabase (Storage) | `xxxxxxxx` |
| `SUPABASE_SERVICE_KEY` | Service key de Supabase (Storage, uploads) | `sb_secret_...` |
| `SUPABASE_BUCKET` | Bucket público para uploads (debe coincidir con el creado en Supabase) | `general` |
| `NODE_ENV` | Entorno | `development` / `production` |
| `PORT` | Puerto del servidor | `3000` |
| `CORS_ORIGIN` | Orígenes permitidos (separados por coma) | `http://localhost:5173,http://localhost:5174,http://localhost:5175` |

> **Nota**: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` **solo** las necesitan consumidores no-API (p. ej. si algún frontend hablara directo con Supabase). La API solo requiere `SUPABASE_PROJECT_ID` + `SUPABASE_SERVICE_KEY` para Storage.

### Frontends (`client-site/.env`, `recruiter-site/.env`, `admin-panel/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL de la API | `"/api"` (default, local) · `https://portafolio-v2-api.vercel.app` (producción) |

---

## 🚀 Deploy (Vercel)

El deploy usa **Vercel Git integration**: cada push a `main` dispara un deploy por proyecto conectado. Hay **4 proyectos** en el equipo Vercel:

| Proyecto Vercel | Root directory | Build |
|-----------------|----------------|-------|
| `portafolio-v2-api` | `/` (raíz del repo) | `vercel.json` → esbuild sobre `api/src/index.ts` |
| `portafolio-v2-client-site` | `client-site` | Vite SPA (`tsc && vite build`) |
| `portafolio-v2-recruiter-site` | `recruiter-site` | Vite SPA (`tsc && vite build`) |
| `portafolio-v2-admin-panel` | `admin-panel` | Vite SPA (`tsc && vite build`) |

- **API**: Vercel deploya el **bundle commiteado** `api/build/index.cjs` (`vercel.json` → `@vercel/node`). El workflow `build-api-bundle.yml` lo regenera con `scripts/build-api.mjs` y lo commitea automáticamente (con PAT del bot) cuando cambian `api/src/**`, `api/prisma/**` o `packages/shared/**`. El bundle está en `.gitignore`, por lo que el workflow lo fuerza con `git add -f`.
- **URL de producción API**: `https://portafolio-v2-api.vercel.app`.
- **Nota de migración (2026-08-30)**: el proyecto Vercel `portafolio-v2-api` se **recreó** como `portafolio-v2-api-v2` (luego renombrado a `portafolio-v2-api`) porque el proyecto original quedó en un estado atascado en el backend de Vercel (`Resource provisioning failed` en todos los deploys, 0ms, sin causa en el código). El proyecto original quedó como `portafolio-v2-api-legacy` (sin git link) como respaldo. El `resourceConfig` del nuevo proyecto se configuró idéntico a los frontends sanos (`fluid: true`, región `iad1`, timeout `300`, memoria `standard`). Las env vars se recrearon desde `api/.env` (ojo: quitar comillas al copiar valores).
- **Env**: registra las variables de la API en el dashboard del proyecto `portafolio-v2-api`; los frontends usan `VITE_API_URL` apuntando a la URL de producción de la API.
- **CI (GitHub Actions)**: `.github/workflows/ci.yml` corre en pushes/PRs a `main`: install → build `@jsoft/shared` → `prisma generate` → typecheck (`pnpm -r run typecheck`) → tests (API, shared y los 3 frontends) → build. Además, `build-api-bundle.yml` regenera y commitea el bundle de la API en cada push a `main`.
- **`deploy.yml` es un placeholder intencional**: los deploys reales ocurren vía la integración Git de Vercel, no por GitHub Actions.

---

## 🧪 Testing

```bash
# Typecheck en todos los paquetes
pnpm -r run typecheck

# API — Jest (~99 tests, umbral 70% coverage)
pnpm --filter api test
pnpm --filter api test -- --coverage

# Shared + Frontends — Vitest
pnpm --filter @jsoft/shared test
pnpm --filter client-site test
pnpm --filter recruiter-site test
pnpm --filter admin-panel test
```

### Archivos de test

| Paquete | Framework | Archivos |
|---------|-----------|----------|
| `api` | Jest 30 | `api/src/__tests__/*.service.test.ts` — 264 tests / 21 suites |
| `@jsoft/shared` | Vitest | `packages/shared/src/**/__tests__/*.test.ts(x)` (schemas, sanitize, MediaCarousel, Lightbox, mediaDelegation) — 140 tests |
| `client-site` | Vitest | `client-site/src/**/*.test.ts(x)` (BlogPage, BlogPostContent, translations, LanguageContext…) — 26 tests |
| `recruiter-site` | Vitest | `recruiter-site/src/**/*.test.ts(x)` (BlogPostContent, LanguageContext, NotFoundPage…) — 22 tests |
| `admin-panel` | Vitest | `admin-panel/src/**/*.test.ts(x)` (suite ejecutada en CI) |

---

## 📖 Documentación

- **Índice de docs**: `docs/README.md`
- **Plan de desarrollo**: `docs/plans/DEVELOPMENT_PLAN.md`
- **Especificaciones técnicas**: `docs/specs/TECHNICAL_SPEC_UPDATED.md`
- **Arquitectura del sistema**: `docs/analysis/SYSTEM_ARCHITECTURE.md`
- **Workflows de prueba manual**: `docs/WORKFLOWS.md`
- **SDD (planificación activa)**: `openspec/specs/` y `openspec/changes/`

---

## 🔐 Seguridad

Ver [SECURITY.md](./SECURITY.md) para la política de seguridad y cómo reportar vulnerabilidades.

---

## 📝 Licencia

Privado — J Soft Solutions © 2026