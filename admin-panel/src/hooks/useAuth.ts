import { useState, useCallback } from 'react';
import { authApi, type UserProfile } from '../api/auth';
import { LoginInput, UpdateProfileInput, UpdateProfileResponse } from '@jsoft/shared';
import axios from 'axios';

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

/**
 * Hook for fetching the full user profile (including email from /auth/me)
 */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.getProfile();
      setProfile(data);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { profile, isLoading, error, fetchProfile };
}

/**
 * Hook for updating profile with loading/error state
 */
export function useUpdateProfile() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const updateProfile = useCallback(async (
    data: UpdateProfileInput & { currentPassword: string }
  ): Promise<UpdateProfileResponse | null> => {
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    try {
      const result = await authApi.updateProfile(data);
      setUpdateSuccess('Profile updated successfully');
      return result;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.error;
        if (errorMsg) {
          setUpdateError(errorMsg);
        } else if (err.response?.status === 401) {
          setUpdateError('Current password is incorrect');
        } else if (err.response?.status === 409) {
          setUpdateError(err.response?.data?.error || 'Username or email already taken');
        } else {
          setUpdateError('Failed to update profile');
        }
      } else {
        setUpdateError('Network error. Please try again.');
      }
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const clearUpdateState = useCallback(() => {
    setUpdateError(null);
    setUpdateSuccess(null);
  }, []);

  return { updateProfile, isUpdating, updateError, updateSuccess, clearUpdateState };
}

/**
 * Hook for sending verification code with loading/error state
 */
export function useSendVerificationCode() {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const sendCode = useCallback(async (): Promise<{ code: string; expiresIn: number } | null> => {
    setIsSending(true);
    setSendError(null);
    try {
      const result = await authApi.sendVerificationCode();
      return result;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setSendError(err.response?.data?.error || 'Failed to send verification code');
      } else {
        setSendError('Network error. Please try again.');
      }
      return null;
    } finally {
      setIsSending(false);
    }
  }, []);

  return { sendCode, isSending, sendError, clearSendError: () => setSendError(null) };
}

/**
 * Hook for changing password with loading/error/success state
 */
export function useChangePassword() {
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  const changePassword = useCallback(async (
    verificationCode: string,
    newPassword: string
  ): Promise<boolean> => {
    setIsChanging(true);
    setChangeError(null);
    setChangeSuccess(null);
    try {
      const result = await authApi.changePassword(verificationCode, newPassword);
      setChangeSuccess(result.message);
      return true;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.error;
        if (errorMsg) {
          setChangeError(errorMsg);
        } else {
          setChangeError('Failed to change password');
        }
      } else {
        setChangeError('Network error. Please try again.');
      }
      return false;
    } finally {
      setIsChanging(false);
    }
  }, []);

  const clearChangeState = useCallback(() => {
    setChangeError(null);
    setChangeSuccess(null);
  }, []);

  return { changePassword, isChanging, changeError, changeSuccess, clearChangeState };
}