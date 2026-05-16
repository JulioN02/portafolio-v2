import { Routes, Route, Navigate } from 'react-router-dom';

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
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />

      {/* Blog Posts */}
      <Route path="/blog-posts" element={<BlogPostsListPage />} />
      <Route path="/blog-posts/create" element={<BlogPostCreatePage />} />
      <Route path="/blog-posts/edit/:id" element={<BlogPostEditPage />} />

      {/* Services */}
      <Route path="/services" element={<ServicesListPage />} />
      <Route path="/services/create" element={<ServiceCreatePage />} />
      <Route path="/services/edit/:id" element={<ServiceEditPage />} />

      {/* Products */}
      <Route path="/products" element={<ProductsListPage />} />
      <Route path="/products/create" element={<ProductCreatePage />} />
      <Route path="/products/edit/:id" element={<ProductEditPage />} />

      {/* Tools */}
      <Route path="/tools" element={<ToolsListPage />} />
      <Route path="/tools/create" element={<ToolCreatePage />} />
      <Route path="/tools/edit/:id" element={<ToolEditPage />} />

      {/* Success Cases */}
      <Route path="/success-cases" element={<SuccessCasesListPage />} />
      <Route path="/success-cases/create" element={<SuccessCaseCreatePage />} />
      <Route path="/success-cases/edit/:id" element={<SuccessCaseEditPage />} />

      {/* Contact Messages */}
      <Route path="/contact-messages" element={<ContactMessagesListPage />} />
      <Route path="/contact-messages/:id" element={<ContactMessageDetailPage />} />

{/* Settings - uses SettingsLayout with nested routes */}
      <Route path="/settings" element={<SettingsLayout />}>
        <Route index element={<Navigate to="/settings/profile" replace />} />
        <Route path="profile" element={<SettingsPage />} />
        <Route path="preferences" element={<SettingsPage />} />
      </Route>

      {/* Pages */}
      <Route path="/pages" element={<PagesListPage />} />

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;