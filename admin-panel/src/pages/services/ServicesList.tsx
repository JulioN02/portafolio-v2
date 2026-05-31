import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loading, ErrorMessage } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useServices } from '../../hooks/useServices';
import { ServiceTable } from '../../components/services/ServiceTable';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';
import formStyles from '../../styles/form.module.css';

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
    <div className={formStyles.adminContainer}>
      <div className={formStyles.pageHeader}>
        <h1 className={formStyles.pageTitle}>{t('services.title')}</h1>
        <Link to="/services/create">
          <button className={formStyles.btnAdd}>+ {t('services.add')}</button>
        </Link>
      </div>

      {/* Filter by classification */}
      <div className={formStyles.filterBar}>
        <input
          className={formStyles.filterSearch}
          placeholder={t('services.filterBy')}
          value={classificationFilter}
          onChange={(e) => setClassificationFilter(e.target.value)}
        />
        <button
          className={formStyles.btnStatus}
          style={!statusFilter ? { backgroundColor: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' } : {}}
          onClick={() => setStatusFilter(undefined)}
        >
          {t('common.all')} ({allServices.length})
        </button>
        <button
          className={formStyles.btnStatus}
          style={statusFilter === 'PUBLISHED' ? { backgroundColor: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' } : {}}
          onClick={() => setStatusFilter('PUBLISHED')}
        >
          {t('blog.published')} ({publishedCount})
        </button>
        <button
          className={formStyles.btnStatus}
          style={statusFilter === 'DRAFT' ? { backgroundColor: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' } : {}}
          onClick={() => setStatusFilter('DRAFT')}
        >
          {t('blog.drafts')} ({draftCount})
        </button>
      </div>

      <div className={formStyles.tableWrapper}>
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
