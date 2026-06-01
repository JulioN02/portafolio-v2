import type { SuccessCaseResponse } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import formStyles from '../../styles/form.module.css';

interface SuccessCaseListProps {
  successCases: SuccessCaseResponse[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

interface ExtendedSuccessCase extends SuccessCaseResponse {
  clientName?: string;
  classification?: string;
  link?: string;
}

const statusClassMap: Record<string, string> = {
  DRAFT: formStyles.badgeDraft,
  PUBLISHED: formStyles.badgePublished,
  PRIVATE: formStyles.badgePrivate,
  ARCHIVED: formStyles.badgeArchived,
};

export function SuccessCaseList({ successCases, onEdit, onDelete, onStatusChange }: SuccessCaseListProps) {
  const { t } = useTranslation();
  const cases = successCases as ExtendedSuccessCase[];

  if (successCases.length === 0) {
    return (
      <div className={formStyles.emptyState}>
        <p>{t('successCases.empty')}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
      {cases.map((successCase) => {
        const badgeClass = statusClassMap[successCase.status] || statusClassMap.DRAFT;
        return (
          <div
            key={successCase.id}
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', margin: 0 }}>{successCase.title}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>
                {successCase.clientName || 'No client name'}
                {successCase.classification && ` • ${successCase.classification}`}
              </p>
            </div>
            {onStatusChange ? (
              <select
                value={successCase.status}
                onChange={(e) => onStatusChange(successCase.id, e.target.value)}
                className={`${badgeClass} ${formStyles.statusSelectInline}`}
              >
                <option value="DRAFT">{t('blog.draft')}</option>
                <option value="PUBLISHED">{t('blog.published')}</option>
                <option value="PRIVATE">{t('blog.private')}</option>
                <option value="ARCHIVED">{t('blog.archived')}</option>
              </select>
            ) : (
              <span className={badgeClass}>{successCase.status}</span>
            )}
            {successCase.link && (
              <a 
                href={successCase.link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'none' }}
              >
                Link ↗
              </a>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={formStyles.btnEdit} onClick={() => onEdit(successCase.id)}>{t('successCases.edit')}</button>
              <button className={formStyles.btnDelete} onClick={() => onDelete(successCase.id)}>{t('successCases.delete')}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
