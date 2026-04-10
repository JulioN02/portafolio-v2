# Portafolio Web v2.0 — J Soft Solutions
## Documento Técnico Actualizado (v1.1)

> **Versión**: 1.1 | **Fecha**: Abril 2026 | **Autor**: Julio — J Soft Solutions
> **Cambios respecto a v1.0**: 5 adiciones de scope confirmadas (order, featured, soft delete, rich text editor, Zod validation)

---

## 1. Decisiones Confirmadas (Adiciones al Scope)

### 1.1 Campo `order` / `position`
- **Dónde**: `Service`, `Product`, `Tool`
- **Tipo**: `Int` (default 0)
- **Propósito**: Reordenamiento manual desde el admin. Los listados ordenan primero por `order ASC`, luego por `createdAt DESC` como fallback.
- **UI Admin**: Flechas arriba/abajo o drag-and-drop en los listados.

### 1.2 Campo `featured` (boolean)
- **Dónde**: `Service`, `Product`, `Tool`
- **Tipo**: `Boolean` (default false)
- **Propósito**: Control explícito de qué aparece en los resúmenes del home.
  - Servicios destacados: `featured=true`, máximo 3
  - Productos destacados: `featured=true`, máximo 5
  - Herramientas destacadas: `featured=true`, máximo 3
- **UI Admin**: Toggle/checkbox en el formulario de cada ítem.

### 1.3 Soft Delete (`deletedAt`)
- **Dónde**: TODAS las entidades de contenido: `Service`, `Product`, `Tool`, `SuccessCase`, `BlogPost`
- **Tipo**: `DateTime?` (nullable)
- **Propósito**: "Eliminar" sin perder datos ni romper referencias. Un ítem con `deletedAt != null` no aparece en las páginas públicas ni en los listados normales del admin, pero se puede recuperar.
- **UI Admin**: Botón "Eliminar" que setea `deletedAt = now()`. Sección "Papelera" opcional para ver y restaurar.
- **Queries**: Todos los SELECT deben filtrar `WHERE deletedAt IS NULL`.

### 1.4 Rich Text Editor
- **Dónde**: Panel administrativo
- **Aplica a**:
  - Cuerpo del blog posts (1,000-1,500 palabras)
  - Descripción completa de servicios
  - Descripción completa de productos
  - Explicación técnica extendida de proyectos (hasta 2,500 palabras)
  - Sección de lecciones aprendidas del blog
- **Propósito**: Editar contenido publicado con formato (negritas, listas, enlaces, imágenes embebidas, código).
- **Opciones evaluadas**:
  - **TipTap**: Headless, extensible, React-friendly. Basado en ProseMirror. Output HTML o JSON. **Recomendado**.
  - **Quill**: Más opinado, menos flexible pero más simple de configurar.
  - **Markdown + Preview**: Más ligero, pero requiere que el usuario sepa Markdown.
- **Decisión**: **TipTap** con extensiones básicas (bold, italic, headings, lists, links, code blocks, images). Output en HTML almacenado en BD.

### 1.5 Validación con Zod
- **Dónde**: Frontend (antes de enviar) + Backend (API layer)
- **Propósito**: Validación de tipos y formatos en todos los formularios. Mejora UX (errores inmediatos) y seguridad (doble validación).
- **Esquema compartido**: Los schemas de Zod se definen en un paquete `shared` y se importan tanto en el frontend como en el backend. DRY.
- **Aplica a**:
  - Todos los formularios de contacto (cliente y reclutador)
  - CRUD de servicios, productos, herramientas
  - CRUD de blog posts
  - Login del admin
  - Upload de archivos (validación de tipo y tamaño)

---

## 2. Schema de Prisma Actualizado

```prisma
// ============================================
// USUARIOS (Admin)
// ============================================
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // bcrypt hash
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ============================================
// SERVICIOS
// ============================================
model Service {
  id                String   @id @default(cuid())
  title             String
  slug              String   @unique
  classification    String
  shortDescription  String   // Descripción breve (catálogo)
  fullDescription   String   // Descripción completa (Rich Text HTML)
  includedItems     String[] // Lista de beneficios/incluidos
  images            String[] // URLs de imágenes
  order             Int      @default(0)
  featured          Boolean  @default(false)
  deletedAt         DateTime?
  
  // Campos técnicos para reclutadores
  technicalExplanation String?  // Explicación extendida (Rich Text HTML, hasta 2500 palabras)
  technicalImages      String[] // Imágenes adicionales para vista de reclutadores
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([featured, deletedAt])
  @@index([order, createdAt])
}

// ============================================
// PRODUCTOS
// ============================================
model Product {
  id                String   @id @default(cuid())
  title             String
  slug              String   @unique
  classification    String
  shortDescription  String
  fullDescription   String   // Rich Text HTML
  images            String[]
  externalLink      String?  // Link opcional al producto/repositorio
  order             Int      @default(0)
  featured          Boolean  @default(false)
  deletedAt         DateTime?
  
  // Campos técnicos para reclutadores
  technicalExplanation String?
  technicalImages      String[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([featured, deletedAt])
  @@index([order, createdAt])
}

// ============================================
// HERRAMIENTAS
// ============================================
model Tool {
  id                String   @id @default(cuid())
  title             String
  slug              String   @unique
  classification    String
  shortDescription  String
  fullDescription   String   // Rich Text HTML
  images            String[]
  requiresInstall   Boolean  @default(false) // true = muestra formulario, false = acceso directo
  order             Int      @default(0)
  featured          Boolean  @default(false)
  deletedAt         DateTime?
  
  // Campos técnicos para reclutadores
  technicalExplanation String?
  technicalImages      String[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([featured, deletedAt])
  @@index([order, createdAt])
}

// ============================================
// CASOS DE ÉXITO
// ============================================
model SuccessCase {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String
  images      String[]
  videos      String[] // URLs de videos
  links       String[] // Links externos de referencia
  deletedAt   DateTime?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([deletedAt])
}

// ============================================
// BLOG POSTS
// ============================================
model BlogPost {
  id            String   @id @default(cuid())
  title         String
  slug          String   @unique
  category      String
  shortDescription String
  coverImage    String
  mediaGallery  String[] // Imágenes y videos adicionales (carrusel)
  body          String   // Rich Text HTML (1,000-1,500 palabras)
  externalLink  String?  // Link a GitHub o recurso relacionado
  lessonsLearned String? // Rich Text HTML - Lecciones aprendidas
  status        PostStatus @default(DRAFT)
  deletedAt     DateTime?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  publishedAt DateTime? // Se setea cuando status cambia a PUBLISHED

  @@index([status, deletedAt])
  @@index([publishedAt])
}

enum PostStatus {
  DRAFT
  PUBLISHED
  PRIVATE
  ARCHIVED
}

// ============================================
// FORMULARIOS DE CONTACTO
// ============================================
model ContactForm {
  id          String   @id @default(cuid())
  firstName   String
  lastName    String?  // Opcional en contacto general
  whatsapp    String?
  email       String
  message     String   // Descripción libre del usuario
  source      String   // "service:Desarrollo Web", "product:ERP", "tool:X", "general", "recruiter"
  originType  FormOrigin // "client" o "recruiter"
  
  createdAt DateTime @default(now())

  @@index([originType, createdAt])
}

enum FormOrigin {
  CLIENT
  RECRUITER
}
```

---

## 3. Impacto en las Fases de Desarrollo

### F0 — Foundation (sin cambio de días: ~2)
- Schema Prisma **ahora incluye**: `order`, `featured`, `deletedAt` en todas las entidades aplicables
- Agregar paquete `shared` con schemas de Zod compartidos
- Contrato OpenAPI actualizado con los nuevos campos

### F1 — Core API (sin cambio de días: ~4)
- CRUD de Servicios **ahora incluye**: validación Zod en entrada, filtrado por `featured`, ordenamiento por `order`
- Endpoint de contacto **ahora incluye**: validación Zod en entrada
- Tests **ahora incluyen**: validación de schemas Zod

### F2 — Admin MVP + Clientes MVP (+1 día: ~8)
- Admin: formulario de servicios **ahora incluye**: rich text editor (TipTap) para `fullDescription`
- Admin: toggle `featured` en formulario
- Admin: controles de reordenamiento (flechas arriba/abajo)
- Admin: "eliminar" ahora es soft delete
- Clientes: query de servicios destacados usa `featured=true` en vez de "primeros 3"

### F3 — Expansión API (sin cambio de días: ~4)
- CRUDs de Product, Tool, SuccessCase **ahora incluyen**: `order`, `featured`, `deletedAt`, validación Zod

### F4 — Clientes Completo (sin cambio de días: ~5)
- Sin cambios mayores, solo consume los campos `featured` correctamente

### F5 — Reclutadores (sin cambio de días: ~6)
- Sin cambios mayores

### F6 — Admin Completo (+1 día: ~4)
- Blog CRUD **ahora incluye**: rich text editor para `body` y `lessonsLearned`
- Formularios de edición de Product y Tool **ahora incluyen**: rich text editor

### F7 — Polish (sin cambio de días: ~3)
- Sin cambios mayores

### Nuevo Total: ~36 días efectivos (antes ~34)

---

## 4. Estructura del Monorepo Propuesta

```
portafolio-v2/
├── api/                          # Backend Express
│   ├── src/
│   │   ├── controllers/          # Orquestación (sin lógica de negocio)
│   │   ├── services/             # Lógica de negocio
│   │   ├── middleware/           # Auth, error handling, validation
│   │   ├── routes/               # Definición de rutas
│   │   ├── utils/                # Helpers (paginate, upload, etc.)
│   │   └── app.ts                # Entry point
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── uploads/                  # Archivos temporales (dev)
│   ├── package.json
│   └── tsconfig.json
│
├── packages/
│   └── shared/                   # Paquete compartido
│       ├── src/
│       │   ├── schemas/          # Schemas de Zod (validación)
│       │   ├── types/            # Tipos TypeScript compartidos
│       │   └── constants/        # Constantes (límites, configs)
│       ├── package.json
│       └── tsconfig.json
│
├── client-site/                  # React app — Página de Clientes
│   ├── src/
│   │   ├── components/           # Componentes reutilizables
│   │   ├── pages/                # Secciones/páginas
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # Llamadas a la API
│   │   ├── styles/               # CSS Modules
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── recruiter-site/               # React app — Página de Reclutadores
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── styles/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── admin-panel/                  # React app — Panel Administrativo
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── styles/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── package.json                  # Root package.json (workspaces)
├── pnpm-workspace.yaml           # o npm workspaces
├── .gitignore
└── README.md
```

---

## 5. Decisiones Pendientes (por resolver antes de F0)

| # | Decisión | Opciones | Recomendación | Estado |
|---|---|---|---|---|
| 1 | Gestor de archivos en producción | S3 (AWS) vs Cloudinary | **Cloudinary** (transformación on-the-fly, CDN incluido, plan free generoso) | ⏳ Pendiente |
| 2 | Plataforma de hosting | Railway vs Render vs VPS | **Railway** (simple, PostgreSQL incluido, deploy automático) | ⏳ Pendiente |
| 3 | Rich Text Editor | TipTap vs Quill vs Markdown | **TipTap** (headless, React-friendly, extensible) | ✅ Confirmado |
| 4 | Validación de formularios | Zod vs Yup vs Joi | **Zod** (compartible frontend/backend, type-safe) | ✅ Confirmado |
| 5 | Package manager | npm vs pnpm vs yarn | **pnpm** (más rápido, disk-efficient, workspaces nativos) | ⏳ Pendiente |

---

## 6. Endpoints API Estimados (Actualizado)

### Auth
- `POST /api/auth/login` — Login admin
- `POST /api/auth/logout` — Logout (opcional, JWT es stateless)

### Servicios
- `GET /api/services` — Listado (con paginación, filtros: featured, classification)
- `GET /api/services/:slug` — Detalle
- `POST /api/services` — Crear (admin)
- `PUT /api/services/:id` — Actualizar (admin)
- `DELETE /api/services/:id` — Soft delete (admin)
- `PUT /api/services/:id/reorder` — Reordenar (admin)

### Productos
- `GET /api/products` — Listado
- `GET /api/products/:slug` — Detalle
- `POST /api/products` — Crear (admin)
- `PUT /api/products/:id` — Actualizar (admin)
- `DELETE /api/products/:id` — Soft delete (admin)
- `PUT /api/products/:id/reorder` — Reordenar (admin)

### Herramientas
- `GET /api/tools` — Listado
- `GET /api/tools/:slug` — Detalle
- `POST /api/tools` — Crear (admin)
- `PUT /api/tools/:id` — Actualizar (admin)
- `DELETE /api/tools/:id` — Soft delete (admin)
- `PUT /api/tools/:id/reorder` — Reordenar (admin)

### Casos de Éxito
- `GET /api/success-cases` — Listado
- `GET /api/success-cases/:slug` — Detalle
- `POST /api/success-cases` — Crear (admin)
- `PUT /api/success-cases/:id` — Actualizar (admin)
- `DELETE /api/success-cases/:id` — Soft delete (admin)

### Blog
- `GET /api/posts` — Listado público (solo published)
- `GET /api/posts/:slug` — Detalle público
- `POST /api/posts` — Crear (admin)
- `PUT /api/posts/:id` — Actualizar (admin)
- `PUT /api/posts/:id/status` — Cambiar estado (admin)
- `DELETE /api/posts/:id` — Soft delete (admin)

### Contacto
- `POST /api/contact` — Enviar formulario (público)
- `GET /api/contact-forms` — Listado (admin, filtrado por originType)
- `GET /api/contact-forms/:id` — Detalle (admin)

### Upload
- `POST /api/upload` — Subir archivo (admin)
- `DELETE /api/upload/:filename` — Eliminar archivo (admin)

### Proyectos (Reclutadores — agregación)
- `GET /api/projects` — Listado unificado (services + products + tools + success-cases)
- `GET /api/projects/recent` — Últimos 3 proyectos

**Total: ~38 endpoints**

---

## 7. Schemas de Zod (Ejemplo de Estructura Compartida)

```typescript
// packages/shared/src/schemas/service.schema.ts
import { z } from 'zod';

export const serviceSchema = z.object({
  title: z.string().min(3).max(100),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  classification: z.string().min(2).max(50),
  shortDescription: z.string().min(10).max(300),
  fullDescription: z.string().min(50), // Rich Text HTML
  includedItems: z.array(z.string().min(3)).min(1),
  images: z.array(z.string().url()).min(1),
  order: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  technicalExplanation: z.string().max(15000).optional(), // ~2500 palabras en HTML
  technicalImages: z.array(z.string().url()).optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

// Schema para contacto del cliente
export const clientContactSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  whatsapp: z.string().regex(/^\+?[0-9]{10,15}$/),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
  source: z.string().min(2).max(100),
});

// Schema para contacto del reclutador
export const recruiterContactSchema = z.object({
  firstName: z.string().min(2).max(50),
  email: z.string().email(),
  whatsapp: z.string().regex(/^\+?[0-9]{10,15}$/).optional(),
  message: z.string().min(10).max(2000),
});

// Schema para login
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});
```

---

## 8. Próximos Pasos

1. **Resolver decisiones pendientes**: Cloudinary vs S3, Railway vs Render, pnpm vs npm
2. **Inicializar el monorepo** con la estructura propuesta
3. **Escribir el schema de Prisma** completo (basado en el de arriba)
4. **Escribir el contrato OpenAPI** de F0 y F1
5. **Definir schemas de Zod** compartidos
6. **Iniciar F0**

Cuando estés listo para empezar a construir, dime y vamos fase por fase.
