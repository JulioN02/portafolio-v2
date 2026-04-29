import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/Home';
import { ServicesPage } from './pages/Services';
import { ServiceDetailPage } from './pages/Services/ServiceDetail';
import { ProductsPage } from './pages/Products';
import { ToolsPage } from './pages/Tools';
import { SuccessCasesPage } from './pages/SuccessCases';
import { ContactPage } from './pages/Contact';
import { NotFoundPage } from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/servicios" element={<ServicesPage />} />
        <Route path="/servicios/:slug" element={<ServiceDetailPage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/productos/:slug" element={<ProductsPage />} />
        <Route path="/herramientas" element={<ToolsPage />} />
        <Route path="/herramientas/:slug" element={<ToolsPage />} />
        <Route path="/casos-de-exito" element={<SuccessCasesPage />} />
        <Route path="/casos-de-exito/:slug" element={<SuccessCasesPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

export default App;