import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Loading, ErrorMessage } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useServices } from '../../hooks/useServices';
import { ServiceTable } from '../../components/services/ServiceTable';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';

export function ServicesListPage() {
  const { t } = useTranslation();
  const [classificationFilter, setClassificationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { useGetAll, useDelete, useUpdateStatus } = useServices();
  const { data, isLoading, error } = useGetAll(
    classificationFilter ? { classification: classificationFilter, page: 1, limit: 10 } : undefined
  );
  const deleteMutation = useDelete();
  const updateStatusMutation = useUpdateStatus();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const handleDelete = (id: string) => {
    const service = data?.data?.find((s) => s.id === id);
    setDeleteTarget({ id, title: service?.title || '' });
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status: status as 'DRAFT' | 'PUBLISHED' | 'PRIVATE' | 'ARCHIVED' });
  };

  const allServices = data?.data || [];
  const filteredServices = statusFilter
    ? allServices.filter((s) => s.status === statusFilter)
    : allServices;

  const draftCount = allServices.filter((s) => s.status === 'DRAFT').length;
  const publishedCount = allServices.filter((s) => s.status === 'PUBLISHED').length;

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

      <div className="admin-filter-bar">
        <Button
          variant={!statusFilter ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter(undefined)}
        >
          {t('common.all')} ({allServices.length})
        </Button>
        <Button
          variant={statusFilter === 'PUBLISHED' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter('PUBLISHED')}
        >
          {t('blog.published')} ({publishedCount})
        </Button>
        <Button
          variant={statusFilter === 'DRAFT' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter('DRAFT')}
        >
          {t('blog.drafts')} ({draftCount})
        </Button>
      </div>

      <div className="admin-card">
        <ServiceTable
          services={filteredServices}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </div>

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.title || ''}
        entityName="servicio"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
