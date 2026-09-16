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
        position="top-right"
        closeButton
        duration={4000}
        toastOptions={{
          classNames: {
            toast: 'jss-toast',
            closeButton: 'jss-toast-close',
            title: 'jss-toast-title',
            description: 'jss-toast-description',
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;