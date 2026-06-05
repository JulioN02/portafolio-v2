import type { SuccessCaseResponse } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import formStyles from '../../styles/form.module.css';
import listStyles from '../shared/ListItem.module.css';

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
    <div className={listStyles.listItem}>
      {cases.map((successCase) => {
        const badgeClass = statusClassMap[successCase.status] || statusClassMap.DRAFT;
        return (
          <div key={successCase.id} className={listStyles.listRow}>
            <div className={listStyles.content}>
              <p className={listStyles.title}>{successCase.title}</p>
              <p className={listStyles.description}>
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
                className={listStyles.statusLink}
              >
                Link ↗
              </a>
            )}
            <div className={listStyles.actions}>
              <button className={formStyles.btnEdit} onClick={() => onEdit(successCase.id)}>{t('successCases.edit')}</button>
              <button className={formStyles.btnDelete} onClick={() => onDelete(successCase.id)}>{t('successCases.delete')}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
