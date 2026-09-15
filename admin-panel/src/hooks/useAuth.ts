import { useState, useCallback } from 'react';
import { authApi, type UserProfile, type ChangePasswordPayload } from '../api/auth';
import { LoginInput, UpdateProfileInput, UpdateProfileResponse } from '@jsoft/shared';
import axios from 'axios';

/** Pull the API error message ({ message, code } shape) or fall back. */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || fallback;
  }
  return 'Network error. Please try again.';
}

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
      setError(extractErrorMessage(err, 'Login failed'));
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
 * Hook for fetching the full user profile (including email + twoFactorEnabled
 * from /auth/me)
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
      setError(extractErrorMessage(err, 'Failed to load profile'));
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
        if (err.response?.status === 401 || err.response?.status === 403) {
          setUpdateError('Current password is incorrect');
        } else if (err.response?.status === 409) {
          setUpdateError(extractErrorMessage(err, 'Username or email already taken'));
        } else {
          setUpdateError(extractErrorMessage(err, 'Failed to update profile'));
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
 * Hook for changing password with loading/error/success state.
 * New contract: { currentPassword, totpCode?, recoveryCode?, newPassword }.
 * A 403/401 from the API ("Current password is incorrect") is surfaced verbatim
 * and the form data is preserved (caller does not reset on error).
 */
export function useChangePassword() {
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  const changePassword = useCallback(async (body: ChangePasswordPayload): Promise<boolean> => {
    setIsChanging(true);
    setChangeError(null);
    setChangeSuccess(null);
    try {
      const result = await authApi.changePassword(body);
      setChangeSuccess(result.message);
      return true;
    } catch (err: unknown) {
      setChangeError(extractErrorMessage(err, 'Failed to change password'));
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

/**
 * Hook for 2FA setup (POST /auth/2fa/setup) with loading/error state.
 */
export function useSetup2fa() {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const setup2fa = useCallback(async () => {
    setIsSettingUp(true);
    setSetupError(null);
    try {
      return await authApi.setup2fa();
    } catch (err: unknown) {
      setSetupError(extractErrorMessage(err, 'Failed to start 2FA setup'));
      return null;
    } finally {
      setIsSettingUp(false);
    }
  }, []);

  return { setup2fa, isSettingUp, setupError, clearSetupError: () => setSetupError(null) };
}

/**
 * Hook for enabling 2FA (POST /auth/2fa/enable) with loading/error state.
 */
export function useEnable2fa() {
  const [isEnabling, setIsEnabling] = useState(false);
  const [enableError, setEnableError] = useState<string | null>(null);

  const enable2fa = useCallback(async (totpCode: string) => {
    setIsEnabling(true);
    setEnableError(null);
    try {
      return await authApi.enable2fa(totpCode);
    } catch (err: unknown) {
      setEnableError(extractErrorMessage(err, 'Failed to enable 2FA'));
      return null;
    } finally {
      setIsEnabling(false);
    }
  }, []);

  return { enable2fa, isEnabling, enableError, clearEnableError: () => setEnableError(null) };
}

/**
 * Hook for disabling 2FA (POST /auth/2fa/disable) with loading/error state.
 */
export function useDisable2fa() {
  const [isDisabling, setIsDisabling] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);
  const [disableSuccess, setDisableSuccess] = useState<string | null>(null);

  const disable2fa = useCallback(async (currentPassword: string, totpCode: string): Promise<boolean> => {
    setIsDisabling(true);
    setDisableError(null);
    setDisableSuccess(null);
    try {
      const result = await authApi.disable2fa(currentPassword, totpCode);
      setDisableSuccess(result.message);
      return true;
    } catch (err: unknown) {
      setDisableError(extractErrorMessage(err, 'Failed to disable 2FA'));
      return false;
    } finally {
      setIsDisabling(false);
    }
  }, []);

  const clearDisableState = useCallback(() => {
    setDisableError(null);
    setDisableSuccess(null);
  }, []);

  return { disable2fa, isDisabling, disableError, disableSuccess, clearDisableState };
}