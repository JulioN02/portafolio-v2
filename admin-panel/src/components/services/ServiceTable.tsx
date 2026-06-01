import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import type { ServiceResponse } from '@jsoft/shared';
import formStyles from '../../styles/form.module.css';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
      {services.map((service) => {
        const badgeClass = statusClassMap[service.status] || statusClassMap.DRAFT;
        return (
          <div
            key={service.id}
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
              <p style={{ fontWeight: '600', margin: 0 }}>{service.title}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
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
