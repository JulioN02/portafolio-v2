import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@jsoft/shared';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
      <Toaster
        richColors
        position="top-right"
        closeButton
        duration={4000}
      />
    </BrowserRouter>
  );
}

export default App;