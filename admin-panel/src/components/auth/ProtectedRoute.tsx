import { Navigate } from 'react-router-dom';
import { authApi } from '../../api/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}