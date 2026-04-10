/**
 * ProtectedRoute - guards routes requiring authentication
 *
 * Redirects to /login if user is not authenticated.
 * Uses React Router's useNavigate for client-side navigation.
 */
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

export interface ProtectedRouteProps {
  /** Whether the user is currently authenticated */
  isAuthenticated: boolean;
  /** Content to render when authenticated */
  children: ReactNode;
  /** Optional path to redirect to (defaults to /login) */
  redirectTo?: string;
}

export function ProtectedRoute({
  isAuthenticated,
  children,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
