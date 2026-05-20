import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedLayout } from '../components/layout/ProtectedLayout';

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
      <Route path="/login" element={<LoginPage />} />

      {/* Protected: All admin routes wrapped in ProtectedLayout (auth + sidebar + header) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/blog-posts"
        element={
          <ProtectedLayout>
            <BlogPostsListPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/blog-posts/create"
        element={
          <ProtectedLayout>
            <BlogPostCreatePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/blog-posts/edit/:id"
        element={
          <ProtectedLayout>
            <BlogPostEditPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/services"
        element={
          <ProtectedLayout>
            <ServicesListPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/services/create"
        element={
          <ProtectedLayout>
            <ServiceCreatePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/services/edit/:id"
        element={
          <ProtectedLayout>
            <ServiceEditPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedLayout>
            <ProductsListPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/products/create"
        element={
          <ProtectedLayout>
            <ProductCreatePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/products/edit/:id"
        element={
          <ProtectedLayout>
            <ProductEditPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/tools"
        element={
          <ProtectedLayout>
            <ToolsListPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/tools/create"
        element={
          <ProtectedLayout>
            <ToolCreatePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/tools/edit/:id"
        element={
          <ProtectedLayout>
            <ToolEditPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/success-cases"
        element={
          <ProtectedLayout>
            <SuccessCasesListPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/success-cases/create"
        element={
          <ProtectedLayout>
            <SuccessCaseCreatePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/success-cases/edit/:id"
        element={
          <ProtectedLayout>
            <SuccessCaseEditPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/contact-messages"
        element={
          <ProtectedLayout>
            <ContactMessagesListPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/contact-messages/:id"
        element={
          <ProtectedLayout>
            <ContactMessageDetailPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedLayout>
            <SettingsLayout />
          </ProtectedLayout>
        }
      >
        <Route index element={<Navigate to="/settings/profile" replace />} />
        <Route path="profile" element={<SettingsPage />} />
        <Route path="preferences" element={<SettingsPage />} />
      </Route>

      <Route
        path="/pages"
        element={
          <ProtectedLayout>
            <PagesListPage />
          </ProtectedLayout>
        }
      />

      {/* Root and fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
