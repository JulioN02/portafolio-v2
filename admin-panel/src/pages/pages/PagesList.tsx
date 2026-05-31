import { Loading } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSiteSections } from '../../hooks/useSiteSections';
import formStyles from '../../styles/form.module.css';

export function PagesList() {
  const { t } = useTranslation();
  const { sections, toggleSection, moveSection, isLoading } = useSiteSections();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className={formStyles.adminContainer}>
      <div className={formStyles.pageHeader}>
        <div>
          <h1 className={formStyles.pageTitle}>{t('pages.title')}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            {t('pages.description')}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className={formStyles.tableWrapper} style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--color-text-main)', fontSize: '0.875rem', lineHeight: '1.5' }}>
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>ℹ️</span>
          <span>
            {t('pages.info')}
          </span>
        </div>
      </div>

      <div className={formStyles.tableWrapper}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('pages.order')}</th>
              <th>{t('pages.section')}</th>
              <th style={{ textAlign: 'center' }}>{t('pages.visible')}</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section, index) => (
              <tr key={section.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      className={formStyles.btnIcon}
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className={formStyles.btnIcon}
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={index === sections.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td style={{ fontWeight: '500', color: 'var(--color-text-title)' }}>
                  {section.label}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    style={{
                      width: '40px',
                      height: '24px',
                      borderRadius: '12px',
                      border: 'none',
                      background: section.visible ? '#10b981' : '#d1d5db',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background 0.2s',
                    }}
                    title={section.visible ? 'Hide' : 'Show'}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '2px',
                        left: section.visible ? '18px' : '2px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#fff',
                        transition: 'left 0.2s',
                      }}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
