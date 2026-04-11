import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/Home';
import { ServicesPage } from './pages/Services';
import { ServiceDetailPage } from './pages/Services/ServiceDetail';
import { ContactPage } from './pages/Contact';
import { NotFoundPage } from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/servicios" element={<ServicesPage />} />
        <Route path="/servicios/:slug" element={<ServiceDetailPage />} />
        {/* Routes for Sprint 2 - uncommented when pages are built */}
        {/* <Route path="/productos" element={<ProductsPage />} /> */}
        {/* <Route path="/productos/:slug" element={<ProductDetailPage />} /> */}
        {/* <Route path="/herramientas" element={<ToolsPage />} /> */}
        {/* <Route path="/herramientas/:slug" element={<ToolDetailPage />} /> */}
        {/* <Route path="/casos-de-exito" element={<SuccessCasesPage />} /> */}
        {/* <Route path="/casos-de-exito/:slug" element={<SuccessCaseDetailPage />} /> */}
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
