# Workflows del Sistema — Portafolio V2

> Documento de flujos de trabajo para verificación y pruebas.
> Versión: 1.0 | Fecha: Mayo 2026

---

## Cómo usar este documento

Cada flujo tiene un **código** (WF-XX), un **origen**, un **destino**, y una **lista de pasos** para probar.
Marca cada paso como ✅ cuando funcione correctamente o ❌ si falla.

---

## WF-01: Autenticación (Login/Logout)

**Descripción**: El admin se autentica para acceder al panel de administración.

**Origen**: Admin Panel → **Destino**: API (JWT)

### Pasos

- [ ] **WF-01.1** Ir a http://localhost:5175/login
- [ ] **WF-01.2** Ingresar credenciales incorrectas → ver mensaje de error
- [ ] **WF-01.3** Ingresar `admin` / `admin123` → redirige al dashboard
- [ ] **WF-01.4** Recargar página → sigue autenticado (JWT en localStorage)
- [ ] **WF-01.5** Cerrar sesión (botón en sidebar) → redirige al login
- [ ] **WF-01.6** Intentar acceder a `/dashboard` sin token → redirige a `/login`

---

## WF-02: CRUD Servicios (Admin → Frontends)

**Descripción**: El admin crea/edita servicios y se reflejan en Client Site y Recruiter Site.

**Origen**: Admin Panel → **Destino**: Client Site + Recruiter Site

### Crear

- [ ] **WF-02.1** En admin, ir a Servicios → Nuevo Servicio
- [ ] **WF-02.2** Llenar: título "Servicio Test", clasificación "Desarrollo", descripción corta, descripción completa (TipTap), items incluidos, imágenes
- [ ] **WF-02.3** Marcar "Featured" y guardar
- [ ] **WF-02.4** Ver que aparece en la lista de servicios del admin
- [ ] **WF-02.5** Ir a http://localhost:5173/servicios → ver el nuevo servicio en el listado
- [ ] **WF-02.6** Ir a http://localhost:5173 → ver que aparece en "Servicios Destacados" (Featured carrusel)
- [ ] **WF-02.7** Ir a http://localhost:5174/proyectos → ver el proyecto con clasificación "Desarrollo"

### Editar

- [ ] **WF-02.8** En admin, editar el servicio → cambiar título, descripción, imágenes
- [ ] **WF-02.9** Guardar y verificar cambios en Client Site (recargar)

### Soft Delete

- [ ] **WF-02.10** En admin, eliminar el servicio → confirmar
- [ ] **WF-02.11** Verificar que desaparece de Client Site y Recruiter Site
- [ ] **WF-02.12** Verificar que el registro sigue en la DB (deletedAt seteado)

---

## WF-03: CRUD Productos (Admin → Client Site)

**Descripción**: El admin crea/edita productos visibles en Client Site.

**Origen**: Admin Panel → **Destino**: Client Site

- [ ] **WF-03.1** En admin, ir a Productos → Nuevo Producto
- [ ] **WF-03.2** Llenar: título "Producto Test", clasificación "Digital", descripción, externalLink, imágenes
- [ ] **WF-03.3** Guardar y ver en listado del admin
- [ ] **WF-03.4** Ir a http://localhost:5173/productos → ver el producto
- [ ] **WF-03.5** Ir a http://localhost:5174/proyectos → ver el proyecto (tipo "Producto", clasificación "Digital")
- [ ] **WF-03.6** Editar y verificar cambios
- [ ] **WF-03.7** Eliminar y verificar que desaparece

---

## WF-04: CRUD Herramientas (Admin → Client Site)

**Descripción**: El admin crea/edita herramientas visibles en Client Site.

**Origen**: Admin Panel → **Destino**: Client Site

- [ ] **WF-04.1** En admin, ir a Herramientas → Nueva Herramienta
- [ ] **WF-04.2** Llenar: título, clasificación, requiresInstall (true/false), descripción, imágenes
- [ ] **WF-04.3** Con `requiresInstall=false` → en Client Site debe mostrar acceso directo
- [ ] **WF-04.4** Con `requiresInstall=true` → en Client Site debe mostrar formulario de contacto
- [ ] **WF-04.5** Ir a http://localhost:5174/proyectos → ver la herramienta

---

## WF-05: CRUD Casos de Éxito (Admin → Client Site)

**Descripción**: El admin crea/edita casos de éxito.

**Origen**: Admin Panel → **Destino**: Client Site

- [ ] **WF-05.1** En admin, ir a Casos de Éxito → Nuevo
- [ ] **WF-05.2** Llenar: título, descripción, imágenes múltiples, videos, links
- [ ] **WF-05.3** Guardar y ver en Client Site: http://localhost:5173/casos-de-exito
- [ ] **WF-05.4** Ver en home (carrusel de casos de éxito)
- [ ] **WF-05.5** Ver en recruiter: http://localhost:5174/proyectos

---

## WF-06: CRUD Blog (Admin → Recruiter Site + Client Site)

**Descripción**: El admin crea posts, cambia estados, se ven en los frontends.

**Origen**: Admin Panel → **Destino**: Recruiter Site + Client Site

### Crear y Publicar

- [ ] **WF-06.1** En admin, ir a Blog → Nuevo Post
- [ ] **WF-06.2** Llenar: título, categoría, shortDescription, body (TipTap), coverImage, mediaGallery, lessonsLearned, externalLink
- [ ] **WF-06.3** Guardar como **DRAFT** (estado por defecto)
- [ ] **WF-06.4** Ir a http://localhost:5174/blog → NO debe aparecer (está en DRAFT)
- [ ] **WF-06.5** Ir a http://localhost:5173/blog → NO debe aparecer

### Cambiar Estado

- [ ] **WF-06.6** En admin, cambiar estado a **PUBLISHED**
- [ ] **WF-06.7** Ir a http://localhost:5174/blog → DEBE aparecer el post
- [ ] **WF-06.8** Ir a http://localhost:5173/blog → DEBE aparecer el post (NUEVO)
- [ ] **WF-06.9** Hacer clic en el post → ver detalle con DOMPurify sanitizado

### Detalle del Post

- [ ] **WF-06.10** Verificar: coverImage, título, categoría, fecha formateada
- [ ] **WF-06.11** Verificar: body renderizado con HTML sanitizado
- [ ] **WF-06.12** Verificar: mediaGallery como grid de imágenes
- [ ] **WF-06.13** Verificar: lessonsLearned renderizado con DOMPurify
- [ ] **WF-06.14** Verificar: externalLink como botón "Ver proyecto en GitHub"

### Archivar

- [ ] **WF-06.15** En admin, cambiar estado a **ARCHIVED**
- [ ] **WF-06.16** Verificar que desaparece de ambos frontends

---

## WF-07: Contacto Clientes (Client Site → Admin Bandeja)

**Descripción**: Un cliente llena el formulario y llega al admin.

**Origen**: Client Site → **Destino**: Admin Panel (bandeja de entrada)

- [ ] **WF-07.1** Ir a http://localhost:5173/contacto
- [ ] **WF-07.2** Llenar: nombre, apellido, email, whatsapp, mensaje
- [ ] **WF-07.3** Enviar → ver mensaje de éxito
- [ ] **WF-07.4** Ir a Admin → Bandeja de Entrada → ver el mensaje con origen "CLIENT"
- [ ] **WF-07.5** Ver detalle del mensaje: todos los campos correctos

### Formulario desde Servicio

- [ ] **WF-07.6** Ir a http://localhost:5173/servicios → abrir detalle de un servicio
- [ ] **WF-07.7** Hacer clic en "Contactar" → modal con source automático del servicio
- [ ] **WF-07.8** Enviar → en admin, ver que el origen dice el nombre del servicio

---

## WF-08: Contacto Reclutadores (Recruiter Site → Admin Bandeja)

**Descripción**: Un reclutador llena el formulario y llega al admin.

**Origen**: Recruiter Site → **Destino**: Admin Panel (bandeja reclutadores)

- [ ] **WF-08.1** Ir a http://localhost:5174/contacto
- [ ] **WF-08.2** Llenar: nombre, email, teléfono, empresa, cargo, presupuesto, mensaje, contacto preferido
- [ ] **WF-08.3** Enviar → ver mensaje de éxito
- [ ] **WF-08.4** Ir a Admin → Bandeja de Entrada → ver el mensaje con origen "RECRUITER"
- [ ] **WF-08.5** Verificar que los campos extra (empresa, cargo, presupuesto) están en el mensaje

---

## WF-09: Proyectos Unificados (Recruiter Site)

**Descripción**: El recruiter site muestra todos los proyectos agregados con filtros.

**Origen**: API (agregación) → **Destino**: Recruiter Site

- [ ] **WF-09.1** Ir a http://localhost:5174/proyectos
- [ ] **WF-09.2** Ver grid con todos los proyectos (Services + Products + Tools + SuccessCases)
- [ ] **WF-09.3** Filtrar por tipo: "Servicios" → solo servicios
- [ ] **WF-09.4** Filtrar por tipo: "Productos" → solo productos
- [ ] **WF-09.5** Filtrar por clasificación: "Desarrollo" → solo proyectos con esa clasificación
- [ ] **WF-09.6** Hacer clic en un proyecto → modal con detalle técnico (DOMPurify)
- [ ] **WF-09.7** Cerrar modal → scroll position preservado
- [ ] **WF-09.8** Paginación: si hay 12+ proyectos, navegar páginas

---

## WF-10: Home Recruiter Site

**Descripción**: Página principal del recruiter con componentes dinámicos.

**Origen**: API → **Destino**: Recruiter Site Home

- [ ] **WF-10.1** Ir a http://localhost:5174
- [ ] **WF-10.2** Ver Hero con foto, nombre, título
- [ ] **WF-10.3** Toggle Perfil "Profesional" / "Técnico" → cambia el texto sin recarga
- [ ] **WF-10.4** TechStack carrusel: se mueve automáticamente
- [ ] **WF-10.5** Pausar carrusel con hover/touch → se detiene
- [ ] **WF-10.6** RecentProjects carrusel: muestra últimos 3 proyectos desde API
- [ ] **WF-10.7** CTA "Contáctame" → scroll a sección de contacto o navega a /contacto

---

## WF-11: SEO Meta Tags

**Descripción**: Cada página pública tiene meta tags para SEO.

- [ ] **WF-11.1** Abrir DevTools → Elements → buscar `<title>` en Client Site
- [ ] **WF-11.2** Navegar cada ruta y verificar que el title cambia correctamente
- [ ] **WF-11.3** Verificar OG tags en cada página (meta[property="og:title"])
- [ ] **WF-11.4** Repetir para Recruiter Site
- [ ] **WF-11.5** En BlogPost, verificar `og:type="article"` y `article:published_time`

---

## WF-12: Error Boundaries

**Descripción**: Los errores no rompen la navegación.

- [ ] **WF-12.1** Abrir DevTools → Network → desconectar la API (offline)
- [ ] **WF-12.2** Navegar por las páginas → deben mostrar "Algo salió mal" con botón Reintentar
- [ ] **WF-12.3** Reconectar API → hacer clic en "Reintentar" → la página se recupera
- [ ] **WF-12.4** Verificar que el menú de navegación sigue funcionando aunque una página falle

---

## WF-13: Responsive Design

**Descripción**: El sistema funciona en todos los tamaños de pantalla.

**Origen**: DevTools (Device Toolbar)

- [ ] **WF-13.1** Probar Client Site en 375px (iPhone SE)
- [ ] **WF-13.2** Probar Client Site en 768px (iPad)
- [ ] **WF-13.3** Probar Client Site en 1440px (Desktop)
- [ ] **WF-13.4** Probar Recruiter Site en 375px, 768px, 1440px
- [ ] **WF-13.5** Probar Admin Panel en 768px y 1440px
- [ ] **WF-13.6** Verificar: sin scroll horizontal, touch targets ≥44px, hover no pegajoso

---

## WF-14: SEO 404

**Descripción**: Páginas no encontradas.

- [ ] **WF-14.1** Ir a http://localhost:5173/ruta-inexistente → redirige a /404
- [ ] **WF-14.2** Ver página 404 con mensaje y link a Home
- [ ] **WF-14.3** Ir a http://localhost:5174/ruta-inexistente → muestra 404
- [ ] **WF-14.4** Verificar title: "404 - Página no encontrada"
- [ ] **WF-14.5** Verificar meta robots: noindex

---

## WF-15: Lazy Loading

**Descripción**: Componentes pesados cargan bajo demanda.

- [ ] **WF-15.1** Ir a Client Site → Servicios → abrir detalle → ver skeleton (React.lazy)
- [ ] **WF-15.2** Ir a Recruiter Site → Blog → abrir post → ver skeleton (BlogPostContent lazy)
- [ ] **WF-15.3** Ir a Admin → Blog → Nuevo Post → ver que el editor TipTap carga (lazy)
- [ ] **WF-15.4** Verificar que imágenes con `loading="lazy"` cargan al hacer scroll

---

## Resumen de Flujos

| Código | Flujo | Frontends Involucrados | Dependencia |
|--------|-------|----------------------|-------------|
| WF-01 | Autenticación | Admin | API + DB |
| WF-02 | CRUD Servicios | Admin → Client + Recruiter | API + DB |
| WF-03 | CRUD Productos | Admin → Client | API + DB |
| WF-04 | CRUD Herramientas | Admin → Client | API + DB |
| WF-05 | CRUD Casos de Éxito | Admin → Client | API + DB |
| WF-06 | CRUD Blog + Estados | Admin → Recruiter + Client | API + DB |
| WF-07 | Contacto Clientes | Client → Admin | API + DB |
| WF-08 | Contacto Reclutadores | Recruiter → Admin | API + DB |
| WF-09 | Proyectos Unificados | Recruiter | API + DB |
| WF-10 | Home Recruiter | Recruiter | API + DB |
| WF-11 | SEO | Client + Recruiter | — |
| WF-12 | Error Boundaries | Todos | — |
| WF-13 | Responsive | Todos | — |
| WF-14 | 404 | Client + Recruiter | — |
| WF-15 | Lazy Loading | Todos | — |
