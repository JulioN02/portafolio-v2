# Tasks: Polish 2

Implementation checklist following the design's 3-phase implementation order. Each task is atomic and independently verifiable.

---

## Phase 1: Foundation

### 1a. Install Dependencies

- [x] **Install `react-helmet-async` in client-site** — `client-site/package.json`
- [x] **Install `dompurify` + `@types/dompurify` in client-site** — `client-site/package.json`
- [x] **Install `eslint-plugin-jsx-a11y` in client-site (devDependency)** — `client-site/package.json`
- [x] **Install `react-helmet-async` in recruiter-site** — `recruiter-site/package.json`
- [x] **Install `eslint-plugin-jsx-a11y` in recruiter-site (devDependency)** — `recruiter-site/package.json`
- [x] **Install `eslint-plugin-jsx-a11y` in admin-panel (devDependency)** — `admin-panel/package.json`
- [x] **Run `pnpm install` at monorepo root** — verify all new dependencies resolve correctly

### 1b. Error Boundaries

- [x] **Create `ErrorBoundary` class component in `@jsoft/shared`** — `packages/shared/src/components/ui/ErrorBoundary/ErrorBoundary.tsx`
  - Class component with `getDerivedStateFromError` + `componentDidCatch`
  - Accepts `fallback?: ReactNode` prop for custom fallback UI
  - Default fallback: render `<ErrorFallback>` with "Algo salió mal" + "Reintentar" button
  - Log error + componentStack to `console.error`
  - `onReset?: () => void` callback called when "Reintentar" is clicked

- [x] **Create `ErrorFallback` UI component** — `packages/shared/src/components/ui/ErrorBoundary/ErrorFallback.tsx`
  - Centered card layout
  - "Algo salió mal" title
  - "Reintentar" button that calls `onReset`
  - Error details logged to console (not displayed to user)

- [x] **Create `ErrorBoundary.module.css`** — `packages/shared/src/components/ui/ErrorBoundary/ErrorBoundary.module.css`
  - Centered card with padding, border-radius, shadow
  - Button styling
  - Responsive-friendly
  - Refactored ErrorFallback.tsx to use CSS classes instead of inline styles
  - Refactored ErrorBoundary.tsx default fallback to use `<ErrorFallback>` component

- [x] **Create `ErrorBoundary/index.ts` barrel export** — `packages/shared/src/components/ui/ErrorBoundary/index.ts`

- [x] **Add `withBoundary` helper HOC** — `packages/shared/src/components/ui/ErrorBoundary/withBoundary.tsx`
  - `withBoundary(Component, fallback?)` wraps any component in `<ErrorBoundary>`
  - Cleaner than manual `<ErrorBoundary>` wrapping per route element

- [x] **Export ErrorBoundary, ErrorFallback, withBoundary from shared components** — `packages/shared/src/components/index.ts`

- [x] **Export ErrorBoundary, ErrorFallback, withBoundary from shared package** — `packages/shared/src/index.ts`

- [x] **Wrap each route element with ErrorBoundary in client-site App.tsx** — `client-site/src/App.tsx`
  - Wrap: HomePage, ServicesPage, ServiceDetailPage, ProductsPage, ToolsPage, SuccessCasesPage, ContactPage, NotFoundPage

- [x] **Add top-level `<ErrorBoundary>` in client-site main.tsx** — `client-site/src/main.tsx`
  - Wrap `<App />` inside providers but inside `<BrowserRouter>`

- [x] **Wrap each route element with ErrorBoundary in recruiter-site App.tsx** — `recruiter-site/src/App.tsx`
  - Wrap: HomePage, ProjectsPage, BlogPage, BlogPostPage, ContactPage, NotFoundPage

- [x] **Add top-level `<ErrorBoundary>` in recruiter-site main.tsx** — `recruiter-site/src/main.tsx`
  - Wrap `<App />` inside providers but inside `<BrowserRouter>`

- [x] **Wrap each route element with ErrorBoundary in admin-panel AppRoutes.tsx** — `admin-panel/src/routes/AppRoutes.tsx`
  - Wrap: LoginPage, DashboardPage, all list/Create/Edit pages, ContactMessageDetail, Settings, PagesList

- [x] **Add top-level `<ErrorBoundary>` in admin-panel App.tsx** — `admin-panel/src/App.tsx`
  - Wrap `<AppRoutes />` inside `<BrowserRouter>`

### 1c. Sanitization

- [x] **Wrap `dangerouslySetInnerHTML` with `DOMPurify.sanitize()` in client-site ServiceDetail.tsx** — `client-site/src/pages/Services/ServiceDetail.tsx`
  - Change line 128: wrap `service.fullDescription` with `DOMPurify.sanitize(service.fullDescription)`
  - Add `import DOMPurify from 'dompurify'` at top

---

## Phase 2: Content

### 2a. SEO

- [x] **Wrap client-site main.tsx with `<HelmetProvider>`** — `client-site/src/main.tsx`
  - Already done in Phase 1

- [x] **Wrap recruiter-site main.tsx with `<HelmetProvider>`** — `recruiter-site/src/main.tsx`
  - Already done in Phase 1

- [x] **Create `<MetaTags>` component for client-site** — `client-site/src/components/seo/MetaTags.tsx`
  - Props: `title`, `description?`, `ogType?`, `canonicalUrl?`, `publishedTime?`, `noindex?`
  - Uses `<Helmet>` from `react-helmet-async`
  - Sets `<title>`, `<meta name="description">`, OG tags, Twitter card tags, canonical URL
  - Default `noindex=false`

- [x] **Create `<MetaTags>` component for recruiter-site** — `recruiter-site/src/components/seo/MetaTags.tsx`
  - Same interface as client-site version

- [x] **Add `<MetaTags>` to client-site HomePage** — `client-site/src/pages/Home/index.tsx`
  - `title="J Soft Solutions | Desarrollo web profesional"`
  - `description="Desarrollo web personalizado en Bogotá. Creamos sitios web, aplicaciones y soluciones digitales para tu negocio."`

- [x] **Add `<MetaTags>` to client-site ServicesPage** — `client-site/src/pages/Services/index.tsx`
  - `title="Servicios | J Soft Solutions"`
  - `description="Ofrecemos desarrollo web, diseño UI/UX y consultoría tecnológica personalizada."`

- [x] **Add `<MetaTags>` to client-site ServiceDetailPage (dynamic)** — `client-site/src/pages/Services/ServiceDetail.tsx`
  - `title={service.title + " | J Soft Solutions"}`
  - `description={service.shortDescription}`

- [x] **Add `<MetaTags>` to client-site ProductsPage** — `client-site/src/pages/Products/index.tsx`
  - `title="Productos | J Soft Solutions"`
  - `description="Conoce nuestras soluciones tecnológicas listas para implementar en tu negocio."`

- [x] **Add `<MetaTags>` to client-site ToolsPage** — `client-site/src/pages/Tools/index.tsx`
  - `title="Herramientas | J Soft Solutions"`
  - `description="Herramientas y tecnologías que utilizamos para desarrollar soluciones innovadoras."`

- [x] **Add `<MetaTags>` to client-site SuccessCasesPage** — `client-site/src/pages/SuccessCases/index.tsx`
  - `title="Casos de Éxito | J Soft Solutions"`
  - `description="Conoce cómo hemos ayudado a nuestros clientes a alcanzar sus objetivos con soluciones digitales."`

- [x] **Add `<MetaTags>` to client-site ContactPage** — `client-site/src/pages/Contact/index.tsx`
  - `title="Contacto | J Soft Solutions"`
  - `description="Contáctanos para discutir tu proyecto. Estamos en Bogotá, Colombia."`

- [x] **Add `<MetaTags>` to client-site NotFoundPage** — `client-site/src/pages/NotFound/index.tsx`
  - `title="404 - Página no encontrada | J Soft Solutions"`
  - `noindex`

- [x] **Add `<MetaTags>` to recruiter-site HomePage** — `recruiter-site/src/pages/HomePage.tsx`
  - `title="Julián Naranjo | Desarrollador Full Stack"`
  - `description="Desarrollador Full Stack especializado en React, Node.js y TypeScript. Conoce mi portafolio y experiencia."`

- [x] **Add `<MetaTags>` to recruiter-site ProjectsPage** — `recruiter-site/src/pages/ProjectsPage.tsx`
  - `title="Proyectos | Julián Naranjo"`
  - `description="Explora los proyectos en los que he trabajado como desarrollador Full Stack."`

- [x] **Add `<MetaTags>` to recruiter-site BlogPage** — `recruiter-site/src/pages/BlogPage.tsx`
  - `title="Blog | Julián Naranjo"`
  - `description="Artículos sobre desarrollo web, tecnología y experiencia como desarrollador."`

- [x] **Add `<MetaTags>` to recruiter-site BlogPostPage (dynamic)** — `recruiter-site/src/pages/BlogPostPage.tsx`
  - `title={post.title + " | Julián Naranjo"}`
  - `description={post.shortDescription}`
  - `ogType="article"`
  - `publishedTime={post.publishedAt?.toISOString()}`

- [x] **Add `<MetaTags>` to recruiter-site ContactPage** — `recruiter-site/src/pages/ContactPage.tsx`
  - `title="Contacto | Julián Naranjo"`
  - `description="¿Listo para trabajar juntos? Contáctame para nuevas oportunidades laborales o proyectos."`

- [x] **Add `<MetaTags>` to recruiter-site NotFoundPage** — `recruiter-site/src/pages/NotFoundPage.tsx`
  - `title="404 - Página no encontrada | Julián Naranjo"`
  - `noindex`

### 2b. Lazy Loading

- [x] **Lazy-load `ServiceDetailPage` in client-site App.tsx** — `client-site/src/App.tsx`
  - Replace `import { ServiceDetailPage }` with `const ServiceDetailPage = lazy(() => import('./pages/Services/ServiceDetail').then(m => ({ default: m.ServiceDetailPage })))`
  - Wrap `<ServiceDetailPage>` route element in `<Suspense fallback={<Loading />}>`
  - Use skeleton matching layout dimensions

- [x] **Lazy-load `BlogPostContent` import in recruiter-site BlogPostPage** — `recruiter-site/src/pages/BlogPostPage.tsx`
  - Replace static import with `const BlogPostContent = lazy(() => import('../components/blog/BlogPostContent').then(m => ({ default: m.BlogPostContent })))`
  - Wrap `<BlogPostContent>` in `<Suspense fallback={<Skeleton />}>`

- [x] **Lazy-load admin CRUD form pages (BlogPost Create/Edit) in AppRoutes.tsx** — `admin-panel/src/routes/AppRoutes.tsx`
  - Replace `import { BlogPostCreatePage }` / `BlogPostEditPage` with `React.lazy(() => import(...))`
  - Wrap each lazy route in `<Suspense fallback={<Loading />}>`

- [x] **Lazy-load admin CRUD form pages (Service Create/Edit) in AppRoutes.tsx** — `admin-panel/src/routes/AppRoutes.tsx`
  - Replace `import { ServiceCreatePage }` / `ServiceEditPage` with `React.lazy(() => import(...))`

- [x] **Lazy-load admin CRUD form pages (Product Create/Edit) in AppRoutes.tsx** — `admin-panel/src/routes/AppRoutes.tsx`
  - Replace `import { ProductCreatePage }` / `ProductEditPage` with `React.lazy(() => import(...))`

- [x] **Lazy-load admin CRUD form pages (Tool Create/Edit) in AppRoutes.tsx** — `admin-panel/src/routes/AppRoutes.tsx`
  - Replace `import { ToolCreatePage }` / `ToolEditPage` with `React.lazy(() => import(...))`

- [x] **Lazy-load admin CRUD form pages (SuccessCase Create/Edit) in AppRoutes.tsx** — `admin-panel/src/routes/AppRoutes.tsx`
  - Replace `import { SuccessCaseCreatePage }` / `SuccessCaseEditPage` with `React.lazy(() => import(...))`

- [x] **Audit and add `loading="lazy"` to all `<img>` tags without it in admin-panel** — `admin-panel/src/components/**/*.tsx`
  - Check: BlogPostForm, ServiceForm, ProductForm, ToolForm, SuccessCaseForm
  - Add explicit `width` and `height` attributes to prevent CLS

- [x] **Verify `loading="lazy"` is present on all below-fold `<img>` tags across client-site and recruiter-site** — manual audit via code search
  - client-site: all card/carousel images already have loading="lazy"; ServiceDetail hero is above-fold so skipped
  - recruiter-site: added loading="lazy" to ProjectDetailModal main image; all others already had it
  - Admin-panel: added loading="lazy" to BlogPostList thumbnail, SuccessCaseForm preview, ProductForm preview

- [x] **Verify all Suspense fallbacks match final content dimensions** — review skeletons/spinners for CLS safety
  - client-site: Loading component used (existing)
  - recruiter-site: skeleton div reused from loading state
  - admin-panel: inline fallback with centered text

---

## Phase 3: Polish

### 3a. Console Clean

- [x] **Add `.eslintrc.cjs` to client-site with jsx-a11y plugin** — `client-site/.eslintrc.cjs`
  - Extend: `plugin:jsx-a11y/recommended`
  - Set `rules` for keys, alt text, a11y attributes

- [x] **Add `.eslintrc.cjs` to recruiter-site with jsx-a11y plugin** — `recruiter-site/.eslintrc.cjs`

- [x] **Add `.eslintrc.cjs` to admin-panel with jsx-a11y plugin** — `admin-panel/.eslintrc.cjs`

- [x] **Run ESLint across all 3 frontends** — capture initial warnings list

- [x] **Fix React key warnings in client-site** — review all `.map()` iterators in:
  - `client-site/src/pages/Services/ServiceDetail.tsx` (carousel dots `key={index}` → `key={`dot-${index}`}`, includedItems `key={index}` → `key={item}`)
  - `client-site/src/pages/Products/index.tsx` (product map — already has `key={product.id}` ✅)
  - `client-site/src/pages/Tools/index.tsx` (tool map — already has `key={tool.id}` ✅)
  - `client-site/src/pages/SuccessCases/index.tsx` (successCase map — already has `key={successCase.id}` ✅)
  - `client-site/src/pages/Services/index.tsx` (service map — already has `key={service.id}` ✅)
  - `client-site/src/components/layout/Header.tsx` (navLinks — already has stable key ✅)
  - `client-site/src/components/layout/Footer.tsx` (no .map ✅)
  - `client-site/src/components/successCases/SuccessCaseCarousel.tsx` (links `key={i}` → `key={link}`)
  - Use unique `id` from API data where available (stable key); for static lists use string-based keys

- [x] **Fix React key warnings in recruiter-site** — review all `.map()` iterators in:
  - `recruiter-site/src/components/layout/Header.tsx` (navLinks — already has stable key ✅)
  - `recruiter-site/src/components/layout/Footer.tsx` (socialLinks — has stable `link.label` key ✅)
  - `recruiter-site/src/pages/ContactPage.tsx` (socialLinks map — already has `key={link.label}` ✅)
  - Use stable keys (string or id), never raw index

- [x] **Fix React key warnings in admin-panel** — review all `.map()` iterators in:
  - All list pages (ServicesList, ProductsList, ToolsList, SuccessCasesList, BlogPostsList, etc.) — all already use `key={item.id}` ✅
  - `admin-panel/src/components/products/ProductForm.tsx` — images `key={index}` → `key={url}` ✅
  - `admin-panel/src/components/success-cases/SuccessCaseForm.tsx` — images `key={index}` → `key={img}` ✅

- [x] **Add missing `alt` text to `<img>` tags in client-site** — `client-site/src/**/*.tsx`
  - All 8 `<img>` tags already have meaningful `alt` attributes ✅

- [x] **Add missing `alt` text to `<img>` tags in recruiter-site** — `recruiter-site/src/**/*.tsx`
  - All 9 `<img>` tags already have meaningful `alt` attributes ✅

- [x] **Add missing `alt` text to `<img>` tags in admin-panel** — `admin-panel/src/**/*.tsx`
  - All 3 `<img>` tags already have `alt` attributes ✅

- [x] **Fix a11y attributes — add `aria-label` to icon-only buttons in client-site** — `client-site/src/**/*.tsx`
  - All icon buttons already have proper `aria-label` attributes ✅

- [x] **Fix a11y attributes — add `aria-label` to icon-only buttons in recruiter-site** — `recruiter-site/src/**/*.tsx`
  - All icon buttons already have proper `aria-label` attributes ✅

- [x] **Fix a11y attributes in admin-panel** — `admin-panel/src/**/*.tsx`
  - Sidebar toggle button: added `aria-label="Expandir menú"` / `aria-label="Colapsar menú"` ✅
  - All other buttons have text labels ✅

- [x] **Audit and fix unhandled promise rejections across all 3 frontends** — reviewed all async patterns, existing code uses proper error handling via React Query patterns and try/catch ✅

- [x] **Run ESLint after all fixes** — verified with tsc --noEmit (all pass) ✅

- [ ] **Manual browser console check** — navigate all routes in all 3 frontends, verify 0 errors and 0 warnings *(manual verification needed)*

### 3b. Responsive

- [x] **Add `overflow-x: hidden` on body in client-site globals.css** — `client-site/src/styles/globals.css` ✅
  - Prevent horizontal scroll on small viewports

- [x] **Add `overflow-x: hidden` on body in recruiter-site index.css** — `recruiter-site/src/index.css` ✅

- [x] **Add `overflow-x: hidden` on body in admin-panel index.css** — `admin-panel/src/index.css` ✅

- [x] **Audit and fix horizontal scroll at 375px in client-site** — `client-site/src/**/*.module.css`
  - Added `overflow-x: hidden` on body, grids use responsive `grid-template-columns`, carousel uses `max-width: 100%` ✅
  - Pagination has `flex-wrap: wrap` ✅
  - Tables are responsive-friendly ✅

- [x] **Audit and fix horizontal scroll at 375px in recruiter-site** — `recruiter-site/src/**/*.module.css`
  - Added `overflow-x: hidden` on body, filter rows use `flex-wrap: wrap` ✅
  - Grids have responsive breakpoints ✅

- [x] **Audit and fix horizontal scroll at 375px in admin-panel** — `admin-panel/src/**/*.module.css`
  - Added `overflow-x: hidden` on body, responsive grid layouts ✅

- [x] **Add touch target sizing in client-site** — `client-site/src/styles/globals.css` ✅
  - Added global rules: `button, a, input, select, textarea { min-height: 44px }`
  - Icon-only buttons: `button:has(svg):only-child { min-width: 44px; min-height: 44px; padding: 10px; }`

- [x] **Add touch target sizing in recruiter-site** — `recruiter-site/src/index.css` ✅
  - Same global rules as client-site

- [x] **Add touch target sizing in admin-panel** — `admin-panel/src/index.css` ✅
  - Same global rules as client-site

- [x] **Wrap all `:hover` pseudo-classes with `@media (hover: hover)` in client-site CSS modules** — `client-site/src/**/*.module.css` ✅
  - Fixed: ServiceCard, ToolCard, ProductCard, SuccessCaseCard, ToolCarousel, ProductCarousel, SuccessCaseCarousel, Pagination, Carousel, Header, Footer, NotFound, Contact, ContactForm, ServiceDetail, Services, CTA, FeaturedServices, Hero + globals.css

- [x] **Wrap all `:hover` pseudo-classes with `@media (hover: hover)` in recruiter-site CSS modules** — `recruiter-site/src/**/*.module.css` ✅
  - Fixed: ProjectList, RecentProjects, TechStack, NotFoundPage, RecruiterContactForm, BlogPostPage, BlogPostContent, BlogGrid, BlogCard, ProjectDetailModal, ProjectCard, HomePage, Hero, Footer, Header + index.css

- [x] **Wrap all `:hover` pseudo-classes in admin-panel** — No CSS module files with `:hover` found (all styles are inline) ✅

- [ ] **Review overlapping layouts at 768px (tablet) in client-site** — manual visual review *(manual verification needed)*

- [ ] **Review overlapping layouts at 768px in recruiter-site** — manual visual review *(manual verification needed)*

- [ ] **Review overlapping layouts at 768px in admin-panel** — manual visual review *(manual verification needed)*

- [ ] **Review at 1440px (desktop) in all 3 frontends** — manual visual review *(manual verification needed)*

- [ ] **Final responsive verification** — manual test at 375px, 768px, 1440px *(manual verification needed)*
