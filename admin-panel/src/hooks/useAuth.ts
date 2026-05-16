import { useState, useCallback } from 'react';
import { authApi } from '../api/auth';
import { LoginInput } from '@jsoft/shared';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(authApi.isAuthenticated());

  const login = useCallback(async (credentials: LoginInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.login(credentials);
      setIsAuthenticated(true);
      return true;
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setIsAuthenticated(false);
    window.location.href = '/login';
  }, []);

  const getUser = useCallback(() => {
    return authApi.getCurrentUser();
  }, []);

  return {
    login,
    logout,
    getUser,
    isAuthenticated,
    isLoading,
    error,
  };
}