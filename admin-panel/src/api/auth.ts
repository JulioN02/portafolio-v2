import { apiClient } from './client';
import { LoginInput, LoginResponse, JwtPayload } from '@jsoft/shared';
import { jwtDecode } from 'jwt-decode';

export const authApi = {
  login: async (credentials: LoginInput): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
    localStorage.setItem('admin_token', data.token);
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('admin_token');
  },
  
  getCurrentUser: (): JwtPayload | null => {
    const token = localStorage.getItem('admin_token');
    if (!token) return null;
    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('admin_token');
  },
};