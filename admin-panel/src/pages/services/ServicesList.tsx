import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Loading, ErrorMessage } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useServices } from '../../hooks/useServices';
import { ServiceTable } from '../../components/services/ServiceTable';

export function ServicesListPage() {
  const { t } = useTranslation();
  const [classificationFilter, setClassificationFilter] = useState('');
  const { useGetAll, useDelete, useToggleFeatured } = useServices();
  const { data, isLoading, error } = useGetAll(
    classificationFilter ? { classification: classificationFilter, page: 1, limit: 10 } : undefined
  );
  const deleteMutation = useDelete();
  const toggleFeaturedMutation = useToggleFeatured();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteMutation.mutate(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const handleToggleFeatured = (id: string, featured: boolean) => {
    toggleFeaturedMutation.mutate({ id, featured });
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={t('common.error')} />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>{t('services.title')}</h1>
        <Link to="/services/create">
          <Button>{t('services.add')}</Button>
        </Link>
      </div>

      {/* Filter by classification */}
      <div className="admin-filter-bar">
        <Input
          id="service-filter"
          placeholder={t('services.filterBy')}
          value={classificationFilter}
          onChange={(e) => setClassificationFilter(e.target.value)}
        />
      </div>

      <div className="admin-card">
        <ServiceTable
          services={data?.data || []}
          onDelete={handleDelete}
          onToggleFeatured={handleToggleFeatured}
        />
      </div>
    </div>
  );
}
