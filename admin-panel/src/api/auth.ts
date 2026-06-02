import { apiClient } from './client';
import { LoginInput, LoginResponse, JwtPayload, UpdateProfileInput, UpdateProfileResponse } from '@jsoft/shared';
import { jwtDecode } from 'jwt-decode';

export interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  role: 'ADMIN';
}

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

  getProfile: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<UserProfile>('/auth/me');
    return data;
  },

  updateProfile: async (profile: UpdateProfileInput & { currentPassword: string }): Promise<UpdateProfileResponse> => {
    const { data } = await apiClient.patch<UpdateProfileResponse>('/auth/profile', profile);
    return data;
  },

  sendVerificationCode: async (): Promise<{ code: string; expiresIn: number }> => {
    const { data } = await apiClient.post<{ code: string; expiresIn: number }>('/auth/verification-code');
    return data;
  },

  changePassword: async (verificationCode: string, newPassword: string): Promise<{ message: string }> => {
    const { data } = await apiClient.patch<{ message: string }>('/auth/password', {
      verificationCode,
      newPassword,
    });
    return data;
  },
};