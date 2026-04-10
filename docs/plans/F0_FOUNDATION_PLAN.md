# F0 — Foundation
## Mini Plan de Ejecución

> **Objetivo**: Cimientos técnicos del proyecto. Todo lo que viene después se construye sobre esto.
> **Duración estimada**: ~2 días efectivos de trabajo

---

## 1. Resumen de Tareas (11 en total)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           F0 — FOUNDATION                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  0.1  Inicializar monorepo                                                  │
│        ├── pnpm-workspace.yaml                                             │
│        └── package.json root                                              │
│                                                                             │
│  0.2  Configurar packages/shared                                           │
│        ├── package.json                                                    │
│        ├── tsconfig.json                                                   │
│        └── src/index.ts (exports)                                          │
│                                                                             │
│  0.3  + 0.4  Escribir Zod schemas + Tipos TS (PARALELO)                    │
│        ├── schemas/service.schema.ts                                       │
│        ├── schemas/product.schema.ts                                       │
│        ├── schemas/tool.schema.ts                                          │
│        ├── schemas/successCase.schema.ts                                   │
│        ├── schemas/blogPost.schema.ts                                       │
│        ├── schemas/contact.schema.ts                                       │
│        ├── schemas/login.schema.ts                                         │
│        └── types/index.ts (export de tipos inferidos)                      │
│                                                                             │
│  0.5  Configurar api/ (Express + TS)                                        │
│        ├── package.json                                                    │
│        ├── tsconfig.json                                                  │
│        ├── src/app.ts                                                     │
│        ├── src/index.ts (entry point)                                      │
│        └── dependencias base                                              │
│                                                                             │
│  0.6  Escribir schema de Prisma                                            │
│        └── prisma/schema.prisma                                           │
│                                                                             │
│  0.7  Ejecutar migración inicial                                           │
│        └── prisma migrate dev                                              │
│                                                                             │
│  0.8  Crear usuario admin inicial                                           │
│        └── seed script o Prisma Studio                                     │
│                                                                             │
│  0.9  Módulo de autenticación                                               │
│        ├── src/middleware/auth.middleware.ts                              │
│        ├── src/services/auth.service.ts                                    │
│        ├── src/controllers/auth.controller.ts                             │
│        └── src/routes/auth.routes.ts                                      │
│                                                                             │
│  0.10  Variables de entorno                                                  │
│        └── .env.example                                                    │
│                                                                             │
│  0.11  Contrato OpenAPI                                                     │
│        └── openapi.yaml                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Pre-Requisitos (ANTES de empezar F0)

| # | Requisito | Cómo verificar |
|---|---|---|
| PR1 | Node.js 20+ instalado | `node -v` |
| PR2 | pnpm instalado | `pnpm -v` |
| PR3 | PostgreSQL instalado y corriendo | `psql -V` o docker |
| PR4 | Git inicializado | `git status` en la carpeta del proyecto |
| PR5 | Cuenta de Cloudinary creada | Panel de Cloudinary accesible |
| PR6 | Repo de GitHub creado y vinculado | `git remote -v` |

**Si algún requisito no está listo, resolverlo ANTES de F0.**

---

## 3. Análisis de cada tarea

### 0.1 — Inicializar monorepo
**Qué hace**: Crea la estructura base del proyecto.
**Archivos a crear**:
- `package.json` root con `private: true`
- `pnpm-workspace.yaml` con los 4 workspaces
- `tsconfig.root.json` para TypeScript raíz

**Ejemplo pnpm-workspace.yaml**:
```yaml
packages:
  - 'api'
  - 'packages/*'
  - 'client-site'
  - 'recruiter-site'
  - 'admin-panel'
```

**Dependencias**: Ninguna. Es el primer paso.

---

### 0.2 — Configurar packages/shared
**Qué hace**: Paquete compartido con Zod schemas y tipos.
**Archivos a crear**:
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/src/index.ts` (re-exports)
- `packages/shared/src/schemas/` (carpeta vacía por ahora)
- `packages/shared/src/types/` (carpeta vacía por ahora)

**Dependencias**: 0.1

---

### 0.3 + 0.4 — Zod schemas + Tipos TypeScript (PARALELO)
**Qué hace**: Define la validación y tipos que se comparten entre backend y frontend.
**Archivos a crear**:
```
packages/shared/src/schemas/
├── service.schema.ts
├── product.schema.ts
├── tool.schema.ts
├── successCase.schema.ts
├── blogPost.schema.ts
├── contact.schema.ts
└── login.schema.ts

packages/shared/src/types/
└── index.ts  (export type ServiceInput = z.infer<typeof serviceSchema>, etc.)
```

**Dependencias**: 0.2

**Por qué paralelos**: Escribirlos juntos garantiza que los tipos derivan correctamente de los schemas.

---

### 0.5 — Configurar api/
**Qué hace**: Backend Express con TypeScript.
**Archivos a crear**:
- `api/package.json` (dependencias: express, prisma, zod, bcrypt, jsonwebtoken, cors, dotenv, multer)
- `api/tsconfig.json`
- `api/src/index.ts` (entry point)
- `api/src/app.ts` (config Express)
- `api/.env` (variables locales)

**Dependencias**: 0.1

---

### 0.6 — Schema de Prisma
**Qué hace**: Define las 7 entidades en el archivo schema.prisma.
**Archivo**: `api/prisma/schema.prisma`

**Dependencias**: 0.5 (para configurar prisma en package.json)

**Qué incluye el schema** (del technical spec):
- User, Service, Product, Tool, SuccessCase, BlogPost, ContactForm
- Campos: todos los de technical spec v1.1 (order, featured, deletedAt, etc.)
- Enums: PostStatus, FormOrigin

---

### 0.7 — Migración inicial
**Qué hace**: Crea las tablas en PostgreSQL local.
**Comando**: `cd api && pnpm prisma migrate dev --name init`

**Dependencias**: 0.6

**Verificación**: Conectar a PostgreSQL y verificar que las tablas existen:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

---

### 0.8 — Usuario admin inicial
**Qué hace**: Crea el primer usuario para acceder al admin.
**Opciones**:
1. **Seed script**: `prisma/seed.ts` que crea user con password hasheada
2. **Prisma Studio**: `pnpm prisma studio` y crear manualmente

**Dependencias**: 0.7

**Credenciales iniciales** (cambiar después del primer login):
```
username: admin
password: cambiar_en_produccion123
```

---

### 0.9 — Módulo de autenticación
**Qué hace**: JWT auth para proteger rutas del admin.
**Archivos a crear**:
- `api/src/services/auth.service.ts` (lógica: verify, generate)
- `api/src/middleware/auth.middleware.ts` (verifica JWT)
- `api/src/controllers/auth.controller.ts` (handler del login)
- `api/src/routes/auth.routes.ts` (POST /auth/login)

**Dependencias**: 0.8 (para poder probar con el user creado)

**Endpoints**:
- `POST /api/auth/login` — Recibe {username, password}, retorna {token, user}

**No es necesario en F0**: Logout, refresh token, forgot password. Esos van después.

---

### 0.10 — Variables de entorno
**Qué hace**: Documenta qué vars necesita el proyecto.
**Archivos**:
- `api/.env.example` (plantilla)
- `api/.env.local` (desarrollo)

**Vars necesarias**:
```bash
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/portafolio_v2"

# JWT
JWT_SECRET="super-secret-key-min-32-chars-abc123"
JWT_EXPIRES_IN="7d"

# Cloudinary (para producción)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# App
NODE_ENV="development"
PORT=3000
```

**Dependencias**: 0.5

---

### 0.11 — Contrato OpenAPI
**Qué hace**: Documenta la API en formato OpenAPI/Swagger.
**Archivo**: `api/openapi.yaml`

**Endpoints a documentar en F0**:
- `POST /api/auth/login` — Request/Response body
- `GET /api/services` — (para F1 pero documentar desde F0)

**Dependencias**: 0.9 (para saber los formatos de auth)

---

## 4. Orden de Ejecución Óptimo

```
DÍA 1 (mañana)
├── 0.1  Inicializar monorepo              ⏱ ~20 min
├── 0.2  Configurar packages/shared         ⏱ ~30 min
├── 0.3  Escribir Zod schemas               ⏱ ~1.5 horas
├── 0.4  Escribir tipos TypeScript          ⏱ ~30 min
└── 0.5  Configurar api/ (Express + TS)    ⏱ ~1 hora

DÍA 1 (tarde)
├── 0.6  Escribir schema de Prisma         ⏱ ~1 hora
├── 0.7  Ejecutar migración inicial         ⏱ ~30 min
└── 0.8  Crear usuario admin inicial        ⏱ ~30 min

DÍA 2 (mañana)
├── 0.9  Módulo de autenticación             ⏱ ~2 horas
├── 0.10 Variables de entorno                ⏱ ~20 min
└── 0.11 Contrato OpenAPI                    ⏱ ~1 hora
```

**Total estimado**: ~9-10 horas efectivas = ~2 días laborales

---

## 5. Criterio de Salida (F0 completado)

| # | Criterio | Cómo verificar |
|---|---|---|
| CS1 | Monorepo funcional con 4 workspaces | `pnpm -w exec pnpm --version` funciona |
| CS2 | packages/shared exporta Zod schemas | `pnpm -F @jsoft/shared run build` |
| CS3 | Schema de Prisma valida sin errores | `pnpm -F api prisma validate` |
| CS4 | Migración corre en PostgreSQL | Tablas existen en DB |
| CS5 | Usuario admin existe y es accesible | Login funciona |
| CS6 | POST /auth/login retorna JWT válido | Probar con Postman/curl |
| CS7 | Middleware protege rutas admin | Sin token → 401, con token → 200 |
| CS8 | Contrato OpenAPI valida sin errores | Swagger Editor |

---

## 6. Dependencias entre tareas (detallado)

```
0.1  Monorepo
   └── 0.2  packages/shared
           └── 0.3  Zod schemas
                  └── 0.4  Tipos TS
                         └─────────────► 0.6  Prisma (0.5 primero)
                                               └─► 0.7  Migración
                                                     └─► 0.8  User admin
                                                           └─► 0.9  Auth
                                                                 └─► 0.11 OpenAPI
                                                0.10 Env vars (de 0.5)
```

**Nota**: 0.6 (Prisma) necesita 0.5 (api/) primero para tener prisma como dependencia.

---

## 7. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Schema Prisma tiene errores de sintaxis | Ejecutar `prisma validate` antes de migrate |
| PostgreSQL no corre o no existe | Verificar con `pg_isready` antes de F0 |
| npm/pnpm mezclados | Usar solo pnpm en todo el proyecto |
| Conflictos de versiones TS | tsconfig.root.json con `composite: true` |
| No se puede crear usuario por password mal hasheada | Usar Prisma Studio si seed falla |

---

## 8. Comandos útiles durante F0

```bash
# Verificar workspaces
pnpm ws list

# Instalar todas las deps
pnpm install

# Validar schema de Prisma
pnpm -F api prisma validate

# Ejecutar migración
pnpm -F api prisma migrate dev --name init

# Abrir Prisma Studio
pnpm -F api prisma studio

# Compilar todo (verificar que no hay errores de TS)
pnpm -r run build

# Levantar API en dev (luego de F0+F1)
pnpm -F api dev
```

---

## 9. Próximo paso

Una vez aprobadas estas tareas y tener los pre-requisitos listos:
1. Inicializar monorepo (0.1)
2. Configurar packages/shared (0.2)
3. Escribir schemas de Zod (0.3)
4. Escribir tipos TypeScript (0.4)
5. Configurar api/ (0.5)

Avísame cuando quieras ejecutar F0. Puedo ayudarte con cada tarea específica o ejecutar directamente.