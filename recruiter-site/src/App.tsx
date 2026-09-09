import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from '@jsoft/shared';
import { useTranslation } from './i18n/LanguageContext';

const EntityDetailPage = lazy(() =>
  import('./pages/EntityDetailPage').then((m) => ({ default: m.EntityDetailPage })),
);

/** Suspense fallback for lazy routes — i18n-ized loading label. */
function RouteFallback() {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
      {t('projectDetailModal.loading')}
    </div>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
          <Route path="/proyectos" element={<ErrorBoundary><ProjectsPage /></ErrorBoundary>} />
          <Route
            path="/proyectos/:tipo/:slug"
            element={
              <ErrorBoundary>
                <Suspense fallback={<RouteFallback />}>
                  <EntityDetailPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route path="/blog" element={<ErrorBoundary><BlogPage /></ErrorBoundary>} />
          <Route path="/blog/:slug" element={<ErrorBoundary><BlogPostPage /></ErrorBoundary>} />
          <Route path="/contacto" element={<ErrorBoundary><ContactPage /></ErrorBoundary>} />
          <Route path="*" element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
        </Route>
      </Routes>
      <Toaster
        richColors
        position="top-right"
        closeButton
        duration={4000}
      />
    </>
  );
}

export default App;
