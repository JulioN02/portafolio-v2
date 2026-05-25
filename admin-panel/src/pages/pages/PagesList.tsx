import { useState } from 'react';
import { Button, Input, Loading } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSiteSections, type SectionOrder } from '../../hooks/useSiteSections';

export function PagesList() {
  const { t } = useTranslation();
  const { sections, toggleSection, moveSection, saveSections, isLoaded } = useSiteSections();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSectionId, setNewSectionId] = useState('');
  const [newSectionLabel, setNewSectionLabel] = useState('');
  const [addError, setAddError] = useState('');

  if (!isLoaded) {
    return <Loading />;
  }

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    const id = newSectionId.trim();
    const label = newSectionLabel.trim();

    if (!id || !label) {
      setAddError(t('pages.required'));
      return;
    }

    if (sections.some((s) => s.id === id)) {
      setAddError(t('pages.duplicate'));
      return;
    }

    const newSection: SectionOrder = {
      id,
      label,
      enabled: true,
    };

    saveSections([...sections, newSection]);
    setNewSectionId('');
    setNewSectionLabel('');
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>{t('pages.title')}</h1>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            {t('pages.description')}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'var(--color-primary-50)', borderColor: 'var(--color-primary-200)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--color-primary-700)', fontSize: '0.875rem', lineHeight: '1.5' }}>
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>ℹ️</span>
          <span>
            {t('pages.info')}
          </span>
        </div>
      </div>

      <div className="admin-card">
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
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={index === sections.length - 1}
                      title="Move down"
                    >
                      ↓
                    </Button>
                  </div>
                </td>
                <td style={{ fontWeight: '500', color: 'var(--color-neutral-900)' }}>
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
                      background: section.enabled ? '#10b981' : '#d1d5db',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background 0.2s',
                    }}
                    title={section.enabled ? 'Hide' : 'Show'}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '2px',
                        left: section.enabled ? '18px' : '2px',
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

      {/* Add Section */}
      <div style={{ marginTop: '1rem' }}>
        {!showAddForm ? (
          <Button variant="secondary" onClick={() => setShowAddForm(true)}>
            {t('pages.add')}
          </Button>
        ) : (
          <div className="admin-card" style={{ padding: '1rem' }}>
            <form
              onSubmit={handleAddSection}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '180px' }}>
                  <Input
                    id="section-id"
                    label={t('pages.idLabel')}
                    value={newSectionId}
                    onChange={(e) => setNewSectionId(e.target.value)}
                    placeholder={t('pages.idPlaceholder')}
                  />
                </div>
                <div style={{ flex: '1', minWidth: '180px' }}>
                  <Input
                    id="section-label"
                    label={t('pages.labelLabel')}
                    value={newSectionLabel}
                    onChange={(e) => setNewSectionLabel(e.target.value)}
                    placeholder={t('pages.labelPlaceholder')}
                  />
                </div>
              </div>

              {addError && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>
                  {addError}
                </p>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button type="submit">{t('pages.addSection')}</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddError('');
                    setNewSectionId('');
                    setNewSectionLabel('');
                  }}
                >
                  {t('pages.cancel')}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
