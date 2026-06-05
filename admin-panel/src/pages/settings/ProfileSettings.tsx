import { useState, useEffect } from 'react';
import { useAuth, useProfile, useUpdateProfile } from '../../hooks/useAuth';
import { useTranslation } from '../../i18n/LanguageContext';
import { toast } from 'sonner';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfileSettings() {
  const { t } = useTranslation();
  const { getUser } = useAuth();
  const { profile, fetchProfile } = useProfile();
  const { updateProfile, isUpdating, updateError, updateSuccess, clearUpdateState } = useUpdateProfile();

  const user = getUser();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch profile on mount to get email
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update local state when profile is fetched
  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setEmail(profile.email || '');
    }
  }, [profile]);

  // Clear password field after successful save
  useEffect(() => {
    if (updateSuccess) {
      toast.success('Perfil actualizado');
      setCurrentPassword('');
    }
  }, [updateSuccess]);

  useEffect(() => {
    if (updateError) {
      toast.error(updateError);
    }
  }, [updateError]);

  const hasChanges = username !== (profile?.username || '') || email !== (profile?.email || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearUpdateState();

    // Client-side validation
    if (!hasChanges) {
      setValidationError(t('settings.noChanges'));
      return;
    }

    if (email && !EMAIL_REGEX.test(email)) {
      setValidationError(t('settings.invalidEmail'));
      return;
    }

    if (!currentPassword) {
      setValidationError(t('settings.currentPasswordRequired'));
      return;
    }

    const updateData: Record<string, string | null> = { currentPassword };

    if (username !== profile?.username) {
      updateData.username = username;
    }

    if (email !== (profile?.email || '')) {
      updateData.email = email || null;
    }

    await updateProfile(updateData as Parameters<typeof updateProfile>[0]);
  };

  return (
    <div>
      <h2
        style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#111827',
        }}
      >
        {t('settings.profile')}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
          {/* Username */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.25rem',
              }}
            >
              {t('settings.name')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                background: '#fff',
                color: '#111827',
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.25rem',
              }}
            >
              {t('settings.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('settings.emailPlaceholder')}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                background: '#fff',
                color: '#111827',
              }}
            />
          </div>

          {/* Role (read-only) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.25rem',
              }}
            >
              {t('settings.role')}
            </label>
            <input
              type="text"
              value={user?.role || 'ADMIN'}
              readOnly
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                background: '#f9fafb',
                color: '#6b7280',
              }}
            />
          </div>

          {/* Current Password (shown when there are unsaved changes) */}
          {hasChanges && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem',
                }}
              >
                {t('settings.currentPassword')}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#111827',
                }}
              />
            </div>
          )}

          {/* Validation error */}
          {validationError && (
            <div
              style={{
                color: '#dc2626',
                fontSize: '0.875rem',
                padding: '0.5rem',
                background: '#fef2f2',
                borderRadius: '6px',
              }}
            >
              {validationError}
            </div>
          )}

          {/* API error */}
          {updateError && (
            <div
              style={{
                color: '#dc2626',
                fontSize: '0.875rem',
                padding: '0.5rem',
                background: '#fef2f2',
                borderRadius: '6px',
              }}
            >
              {updateError}
            </div>
          )}

          {/* Success message */}
          {updateSuccess && (
            <div
              style={{
                color: '#16a34a',
                fontSize: '0.875rem',
                padding: '0.5rem',
                background: '#f0fdf4',
                borderRadius: '6px',
              }}
            >
              {updateSuccess}
            </div>
          )}

          {/* Save button */}
          <div style={{ marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={isUpdating || !hasChanges}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '6px',
                border: 'none',
                background: isUpdating || !hasChanges ? '#93c5fd' : '#3b82f6',
                color: '#fff',
                fontWeight: '500',
                cursor: isUpdating || !hasChanges ? 'not-allowed' : 'pointer',
              }}
            >
              {isUpdating ? t('settings.saving') : t('settings.saveProfile')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
