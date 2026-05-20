import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@jsoft/shared';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;