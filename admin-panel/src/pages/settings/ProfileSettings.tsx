import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../i18n/LanguageContext';

export function ProfileSettings() {
  const { t } = useTranslation();
  const { getUser } = useAuth();
  const user = getUser();

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

      <div style={{ display: 'grid', gap: '1rem' }}>
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
            value={user?.username || 'Admin'}
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
      </div>
    </div>
  );
}
