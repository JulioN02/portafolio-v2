import { Link } from 'react-router-dom';
import { Button } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import type { ServiceResponse } from '@jsoft/shared';

interface ServiceTableProps {
  services: ServiceResponse[];
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
}

export function ServiceTable({ services, onDelete, onToggleFeatured }: ServiceTableProps) {
  const { t } = useTranslation();

  if (services.length === 0) {
    return (
      <div className="admin-empty">
        <div className="admin-empty-icon">📋</div>
        <div className="admin-empty-text">{t('services.empty')}</div>
      </div>
    );
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Classification</th>
          <th style={{ textAlign: 'center' }}>{t('services.featured')}</th>
          <th style={{ textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {services.map((service) => (
          <tr key={service.id}>
            <td>{service.title}</td>
            <td>{service.classification}</td>
            <td style={{ textAlign: 'center' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onToggleFeatured(service.id, !service.featured)}
              >
                {service.featured ? t('common.yes') : t('common.no')}
              </Button>
            </td>
            <td style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <Link to={`/services/edit/${service.id}`}>
                  <Button variant="secondary" size="sm">{t('services.edit')}</Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => onDelete(service.id)}>{t('services.delete')}</Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
