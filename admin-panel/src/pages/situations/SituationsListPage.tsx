import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loading } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSituations } from '../../hooks/useSituations';
import { getApiErrorMessage } from '../../utils/apiError';
import formStyles from '../../styles/form.module.css';

export function SituationsListPage() {
  const { t } = useTranslation();
  const { useGetAll, usePatch, useDelete } = useSituations();
  const { data: situations = [], isLoading } = useGetAll();
  const patch = usePatch();
  const remove = useDelete();
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <Loading />;

  const move = (id: string, direction: 'up' | 'down') => {
    const index = situations.findIndex((s) => s.id === id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (index === -1 || swapIndex < 0 || swapIndex >= situations.length) return;
    const current = situations[index];
    const neighbour = situations[swapIndex];
    patch.mutate({ id: current.id, data: { order: neighbour.order } });
    patch.mutate({ id: neighbour.id, data: { order: current.order } });
  };

  const toggleActive = (id: string, active: boolean) => {
    setError(null);
    patch.mutate(
      { id, data: { active: !active } },
      { onError: (e) => setError(getApiErrorMessage(e)) },
    );
  };

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`${t('situations.confirmDelete')} "${title}"?`)) return;
    setError(null);
    remove.mutate(id, { onError: (e) => setError(getApiErrorMessage(e)) });
  };

  return (
    <div className={formStyles.adminContainer}>
      <div className={formStyles.pageHeader}>
        <div>
          <h1 className={formStyles.pageTitle}>{t('situations.title')}</h1>
          <p className={formStyles.hint}>{t('situations.description')}</p>
        </div>
        <Link to="/situations/create" className={formStyles.btnPrimary}>
          {t('situations.create')}
        </Link>
      </div>

      {error && <p className={formStyles.formError} role="alert">{error}</p>}

      <div className={formStyles.tableWrapper}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('situations.order')}</th>
              <th>{t('situations.name')}</th>
              <th>{t('situations.services')}</th>
              <th style={{ textAlign: 'center' }}>{t('situations.active')}</th>
              <th style={{ textAlign: 'right' }}>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {situations.map((situation, index) => (
              <tr key={situation.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className={formStyles.btnIcon} onClick={() => move(situation.id, 'up')} disabled={index === 0} title={t('situations.moveUp')}>↑</button>
                    <button className={formStyles.btnIcon} onClick={() => move(situation.id, 'down')} disabled={index === situations.length - 1} title={t('situations.moveDown')}>↓</button>
                  </div>
                </td>
                <td>
                  <strong style={{ color: 'var(--color-text-title)' }}>{situation.title}</strong>
                  <div className={formStyles.hint}>{situation.description}</div>
                </td>
                <td>
                  {situation.services.length === 0
                    ? <span className={formStyles.hint}>{t('situations.noServices')}</span>
                    : situation.services.map((s) => (
                        <div key={s.id} style={{ fontSize: '0.8125rem' }}>
                          {s.title} <span className={formStyles.hint}>({s.status})</span>
                        </div>
                      ))}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => toggleActive(situation.id, situation.active)}
                    aria-pressed={situation.active}
                    aria-label={situation.active ? t('situations.deactivate') : t('situations.activate')}
                    style={{ minWidth: '44px', minHeight: '24px', padding: '0 0.5rem', borderRadius: '12px', border: 'none', background: situation.active ? '#10b981' : '#d1d5db', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {situation.active ? t('situations.on') : t('situations.off')}
                  </button>
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <Link to={`/situations/edit/${situation.id}`} className={formStyles.btnIcon} title={t('common.edit')}>✎</Link>
                  <button className={formStyles.btnIcon} onClick={() => handleDelete(situation.id, situation.title)} title={t('common.delete')}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
