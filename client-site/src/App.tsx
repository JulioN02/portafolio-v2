import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/Home';
import { ServicesPage } from './pages/Services';
import { ProductsPage } from './pages/Products';
import { ToolsPage } from './pages/Tools';
import { SuccessCasesPage } from './pages/SuccessCases';
import { ContactPage } from './pages/Contact';
import { BlogPage } from './pages/Blog';
import { BlogPostPage } from './pages/Blog/BlogPost';
import { NotFoundPage } from './pages/NotFound';
import { ErrorBoundary } from '@jsoft/shared';
import { Loading } from './components/common/Loading';

const ServiceDetailPage = lazy(() => import('./pages/Services/ServiceDetail').then(m => ({ default: m.ServiceDetailPage })));

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
        <Route path="/servicios" element={<ErrorBoundary><ServicesPage /></ErrorBoundary>} />
        <Route path="/servicios/:slug" element={<ErrorBoundary><Suspense fallback={<Loading />}><ServiceDetailPage /></Suspense></ErrorBoundary>} />
        <Route path="/productos" element={<ErrorBoundary><ProductsPage /></ErrorBoundary>} />
        <Route path="/productos/:slug" element={<ErrorBoundary><ProductsPage /></ErrorBoundary>} />
        <Route path="/herramientas" element={<ErrorBoundary><ToolsPage /></ErrorBoundary>} />
        <Route path="/herramientas/:slug" element={<ErrorBoundary><ToolsPage /></ErrorBoundary>} />
        <Route path="/casos-de-exito" element={<ErrorBoundary><SuccessCasesPage /></ErrorBoundary>} />
        <Route path="/casos-de-exito/:slug" element={<ErrorBoundary><SuccessCasesPage /></ErrorBoundary>} />
        <Route path="/blog" element={<ErrorBoundary><BlogPage /></ErrorBoundary>} />
        <Route path="/blog/:slug" element={<ErrorBoundary><BlogPostPage /></ErrorBoundary>} />
        <Route path="/contacto" element={<ErrorBoundary><ContactPage /></ErrorBoundary>} />
        <Route path="/404" element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
