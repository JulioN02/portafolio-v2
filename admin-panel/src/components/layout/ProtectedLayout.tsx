import { Navigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { DashboardLayout } from './DashboardLayout';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
