import { apiClient } from './client';
import {
  LoginInput,
  LoginResponse,
  JwtPayload,
  UpdateProfileInput,
  UpdateProfileResponse,
  TwoFactorSetupResponse,
  TwoFactorEnableResponse,
} from '@jsoft/shared';
import { jwtDecode } from 'jwt-decode';

export interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  role: 'ADMIN';
  twoFactorEnabled: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  totpCode?: string;
  recoveryCode?: string;
  newPassword: string;
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

  setup2fa: async (): Promise<TwoFactorSetupResponse> => {
    const { data } = await apiClient.post<TwoFactorSetupResponse>('/auth/2fa/setup');
    return data;
  },

  enable2fa: async (totpCode: string): Promise<TwoFactorEnableResponse> => {
    const { data } = await apiClient.post<TwoFactorEnableResponse>('/auth/2fa/enable', { totpCode });
    return data;
  },

  disable2fa: async (currentPassword: string, totpCode: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/auth/2fa/disable', {
      currentPassword,
      totpCode,
    });
    return data;
  },

  changePassword: async (body: ChangePasswordPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.patch<{ message: string }>('/auth/password', body);
    return data;
  },
};