import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatusSelect } from '@/components/shared/StatusSelect';
import type { ServiceResponse } from '@jsoft/shared';
import formStyles from '../../styles/form.module.css';

interface ServiceTableProps {
  services: ServiceResponse[];
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

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
    <table className="admin-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Classification</th>
          {onStatusChange && <th style={{ textAlign: 'center' }}>{t('blog.status')}</th>}
          <th style={{ textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {services.map((service) => (
          <tr key={service.id}>
            <td>{service.title}</td>
            <td>{service.classification}</td>
            {onStatusChange && (
              <td style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <StatusBadge status={service.status} />
                  <StatusSelect value={service.status} onChange={(newStatus) => onStatusChange(service.id, newStatus)} />
                </div>
              </td>
            )}
            <td style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <Link to={`/services/edit/${service.id}`}>
                  <button className={formStyles.btnEdit}>{t('services.edit')}</button>
                </Link>
                <button className={formStyles.btnDelete} onClick={() => onDelete(service.id)}>{t('services.delete')}</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
