import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedLayout } from '../components/layout/ProtectedLayout';
import { ErrorBoundary } from '@jsoft/shared';

// Login (public)
import { LoginPage } from '../pages/LoginPage';

// Dashboard
import { DashboardPage } from '../pages/Dashboard';

// Blog Posts
import { BlogPostsListPage } from '../pages/blog-posts/BlogPostsListPage';

// Services
import { ServicesListPage } from '../pages/services/ServicesList';

// Products
import { ProductsListPage } from '../pages/products/ProductsList';

// Tools
import { ToolsListPage } from '../pages/tools/ToolsList';

// SuccessCases
import { SuccessCasesList as SuccessCasesListPage } from '../pages/success-cases/SuccessCasesList';

// Contact Messages
import { ContactMessagesListPage } from '../pages/contact-messages/ContactMessagesList';
import { ContactMessageDetailPage } from '../pages/contact-messages/ContactMessageDetail';

// Settings
import { SettingsLayout } from '../pages/settings/SettingsLayout';
import { ProfileSettings } from '../pages/settings/ProfileSettings';
import { PreferencesSettings } from '../pages/settings/PreferencesSettings';
import { SecuritySettings } from '../pages/settings/SecuritySettings';

// Pages
import { PagesList as PagesListPage } from '../pages/pages/PagesList';

// Lazy-loaded CRUD form pages
const BlogPostCreatePage = lazy(() => import('../pages/blog-posts/BlogPostCreatePage').then(m => ({ default: m.BlogPostCreatePage })));
const BlogPostEditPage = lazy(() => import('../pages/blog-posts/BlogPostEditPage').then(m => ({ default: m.BlogPostEditPage })));
const ServiceCreatePage = lazy(() => import('../pages/services/ServiceCreate').then(m => ({ default: m.ServiceCreatePage })));
const ServiceEditPage = lazy(() => import('../pages/services/ServiceEdit').then(m => ({ default: m.ServiceEditPage })));
const ProductCreatePage = lazy(() => import('../pages/products/ProductCreate').then(m => ({ default: m.ProductCreatePage })));
const ProductEditPage = lazy(() => import('../pages/products/ProductEdit').then(m => ({ default: m.ProductEditPage })));
const ToolCreatePage = lazy(() => import('../pages/tools/ToolCreate').then(m => ({ default: m.ToolCreatePage })));
const ToolEditPage = lazy(() => import('../pages/tools/ToolEdit').then(m => ({ default: m.ToolEditPage })));
const SuccessCaseCreatePage = lazy(() => import('../pages/success-cases/SuccessCaseCreate').then(m => ({ default: m.SuccessCaseCreate })));
const SuccessCaseEditPage = lazy(() => import('../pages/success-cases/SuccessCaseEdit').then(m => ({ default: m.SuccessCaseEdit })));

function AppRoutes() {
  return (
    <Routes>
      {/* Public: Login */}
      <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />

      {/* Protected: All admin routes wrapped in ProtectedLayout (auth + sidebar + header) */}
      <Route
        path="/dashboard"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <DashboardPage />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />

      <Route
        path="/blog-posts"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <BlogPostsListPage />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/blog-posts/create"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Cargando...</div>}>
                <BlogPostCreatePage />
              </Suspense>
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/blog-posts/edit/:id"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Cargando...</div>}>
                <BlogPostEditPage />
              </Suspense>
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />

      <Route
        path="/services"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <ServicesListPage />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/services/create"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Cargando...</div>}>
                <ServiceCreatePage />
              </Suspense>
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/services/edit/:id"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Cargando...</div>}>
                <ServiceEditPage />
              </Suspense>
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />

      <Route
        path="/products"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <ProductsListPage />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/products/create"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Cargando...</div>}>
                <ProductCreatePage />
              </Suspense>
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/products/edit/:id"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Cargando...</div>}>
                <ProductEditPage />
              </Suspense>
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />

      <Route
        path="/tools"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <ToolsListPage />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/tools/create"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Cargando...</div>}>
                <ToolCreatePage />
              </Suspense>
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/tools/edit/:id"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Cargando...</div>}>
                <ToolEditPage />
              </Suspense>
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />

      <Route
        path="/success-cases"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <SuccessCasesListPage />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/success-cases/create"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Cargando...</div>}>
                <SuccessCaseCreatePage />
              </Suspense>
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/success-cases/edit/:id"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Cargando...</div>}>
                <SuccessCaseEditPage />
              </Suspense>
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />

      <Route
        path="/contact-messages"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <ContactMessagesListPage />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/contact-messages/:id"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <ContactMessageDetailPage />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />

      <Route
        path="/settings"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <SettingsLayout />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      >
        <Route index element={<Navigate to="/settings/profile" replace />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="preferences" element={<PreferencesSettings />} />
        <Route path="security" element={<SecuritySettings />} />
      </Route>

      <Route
        path="/pages"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <PagesListPage />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />

      {/* Root and fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
