import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import type { ServiceResponse } from '@jsoft/shared';
import formStyles from '../../styles/form.module.css';
import listStyles from '../shared/ListItem.module.css';

interface ServiceTableProps {
  services: ServiceResponse[];
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const statusClassMap: Record<string, string> = {
  DRAFT: formStyles.badgeDraft,
  PUBLISHED: formStyles.badgePublished,
  PRIVATE: formStyles.badgePrivate,
  ARCHIVED: formStyles.badgeArchived,
};

export function ServiceTable({ services, onDelete, onStatusChange }: ServiceTableProps) {
  const { t } = useTranslation();

  if (services.length === 0) {
    return (
      <div className={formStyles.emptyState}>
        <p>{t('services.empty')}</p>
      </div>
    );
  }

  return (
    <div className={listStyles.listItem}>
      {services.map((service) => {
        const badgeClass = statusClassMap[service.status] || statusClassMap.DRAFT;
        return (
          <div key={service.id} className={listStyles.listRow}>
            <div className={listStyles.content}>
              <p className={listStyles.title}>{service.title}</p>
              <p className={listStyles.description}>
                {service.classification}
              </p>
            </div>
            {onStatusChange ? (
              <select
                value={service.status}
                onChange={(e) => onStatusChange(service.id, e.target.value)}
                className={`${badgeClass} ${formStyles.statusSelectInline}`}
              >
                <option value="DRAFT">{t('blog.draft')}</option>
                <option value="PUBLISHED">{t('blog.published')}</option>
                <option value="PRIVATE">{t('blog.private')}</option>
                <option value="ARCHIVED">{t('blog.archived')}</option>
              </select>
            ) : (
              <span className={badgeClass}>{service.status}</span>
            )}
            <div className={listStyles.actions}>
              <Link to={`/services/edit/${service.id}`}>
                <button className={formStyles.btnEdit}>{t('services.edit')}</button>
              </Link>
              <button className={formStyles.btnDelete} onClick={() => onDelete(service.id)}>{t('services.delete')}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
