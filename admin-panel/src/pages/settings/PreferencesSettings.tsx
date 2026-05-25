import { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';

interface UserPreferences {
  theme: 'light' | 'dark';
  itemsPerPage: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  itemsPerPage: 10,
};

const STORAGE_KEY = 'admin_user_preferences';

export function PreferencesSettings() {
  const { t, lang, setLang } = useTranslation();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch {
        setPreferences(DEFAULT_PREFERENCES);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document.body.classList.toggle('dark-theme', preferences.theme === 'dark');
  }, [preferences.theme]);

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setPreferences((prev) => ({ ...prev, theme }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setPreferences((prev) => ({ ...prev, itemsPerPage }));
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
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
        {t('settings.preferences')}
      </h2>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '0.5rem',
            }}
          >
            {t('settings.theme')}
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: preferences.theme === 'light' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                background: preferences.theme === 'light' ? '#eff6ff' : '#fff',
                color: preferences.theme === 'light' ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
              }}
            >
              {t('settings.light')}
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: preferences.theme === 'dark' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                background: preferences.theme === 'dark' ? '#eff6ff' : '#fff',
                color: preferences.theme === 'dark' ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
              }}
            >
              {t('settings.dark')}
            </button>
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '0.5rem',
            }}
          >
            {t('settings.itemsPerPage')}
          </label>
          <select
            value={preferences.itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#fff',
              color: '#111827',
              minWidth: '120px',
            }}
          >
            <option value={10}>{preferences.itemsPerPage} items</option>
            <option value={25}>25 items</option>
            <option value={50}>50 items</option>
          </select>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '0.5rem',
            }}
          >
            {t('settings.language')}
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setLang('es')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: lang === 'es' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                background: lang === 'es' ? '#eff6ff' : '#fff',
                color: lang === 'es' ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
              }}
            >
              {t('settings.spanish')}
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: lang === 'en' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                background: lang === 'en' ? '#eff6ff' : '#fff',
                color: lang === 'en' ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
              }}
            >
              {t('settings.english')}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={handleSave}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '6px',
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          {t('settings.save')}
        </button>

        {isSaved && (
          <span style={{ color: '#10b981', fontSize: '0.875rem' }}>
            {t('settings.saved')}
          </span>
        )}
      </div>
    </div>
  );
}
