import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from '@jsoft/shared';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
        <Route path="/proyectos" element={<ErrorBoundary><ProjectsPage /></ErrorBoundary>} />
        <Route path="/blog" element={<ErrorBoundary><BlogPage /></ErrorBoundary>} />
        <Route path="/blog/:slug" element={<ErrorBoundary><BlogPostPage /></ErrorBoundary>} />
        <Route path="/contacto" element={<ErrorBoundary><ContactPage /></ErrorBoundary>} />
        <Route path="*" element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
      </Route>
    </Routes>
  );
}

export default App;
