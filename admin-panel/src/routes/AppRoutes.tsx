import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedLayout } from '../components/layout/ProtectedLayout';
import { ErrorBoundary } from '@jsoft/shared';

// Login (public)
import { LoginPage } from '../pages/LoginPage';

// Dashboard
import { DashboardPage } from '../pages/Dashboard';

// Blog Posts
import { BlogPostsListPage } from '../pages/blog-posts/BlogPostsListPage';
import { BlogPostCreatePage } from '../pages/blog-posts/BlogPostCreatePage';
import { BlogPostEditPage } from '../pages/blog-posts/BlogPostEditPage';

// Services
import { ServicesListPage } from '../pages/services/ServicesList';
import { ServiceCreatePage } from '../pages/services/ServiceCreate';
import { ServiceEditPage } from '../pages/services/ServiceEdit';

// Products
import { ProductsListPage } from '../pages/products/ProductsList';
import { ProductCreatePage } from '../pages/products/ProductCreate';
import { ProductEditPage } from '../pages/products/ProductEdit';

// Tools
import { ToolsListPage } from '../pages/tools/ToolsList';
import { ToolCreatePage } from '../pages/tools/ToolCreate';
import { ToolEditPage } from '../pages/tools/ToolEdit';

// SuccessCases
import { SuccessCasesList as SuccessCasesListPage } from '../pages/success-cases/SuccessCasesList';
import { SuccessCaseCreate as SuccessCaseCreatePage } from '../pages/success-cases/SuccessCaseCreate';
import { SuccessCaseEdit as SuccessCaseEditPage } from '../pages/success-cases/SuccessCaseEdit';

// Contact Messages
import { ContactMessagesListPage } from '../pages/contact-messages/ContactMessagesList';
import { ContactMessageDetailPage } from '../pages/contact-messages/ContactMessageDetail';

// Settings
import { SettingsLayout } from '../pages/settings/SettingsLayout';
import { SettingsPage } from '../pages/settings/SettingsPage';

// Pages
import { PagesList as PagesListPage } from '../pages/pages/PagesList';

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
              <BlogPostCreatePage />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/blog-posts/edit/:id"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <BlogPostEditPage />
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
              <ServiceCreatePage />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/services/edit/:id"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <ServiceEditPage />
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
              <ProductCreatePage />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/products/edit/:id"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <ProductEditPage />
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
              <ToolCreatePage />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/tools/edit/:id"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <ToolEditPage />
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
              <SuccessCaseCreatePage />
            </ProtectedLayout>
          </ErrorBoundary>
        }
      />
      <Route
        path="/success-cases/edit/:id"
        element={
          <ErrorBoundary>
            <ProtectedLayout>
              <SuccessCaseEditPage />
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
        <Route path="profile" element={<SettingsPage />} />
        <Route path="preferences" element={<SettingsPage />} />
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
