import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loading, ErrorMessage } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSuccessCases } from '../../hooks/useSuccessCases';
import { SuccessCaseList } from '../../components/success-cases/SuccessCaseList';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';
import formStyles from '../../styles/form.module.css';

export function SuccessCasesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { useGetAll, useDelete, useUpdateStatus } = useSuccessCases();
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { data, isLoading, error } = useGetAll({ page, limit });
  const deleteMutation = useDelete();
  const updateStatusMutation = useUpdateStatus();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const handleDelete = (id: string) => {
    const successCase = data?.data?.find((c) => c.id === id);
    setDeleteTarget({ id, title: successCase?.title || '' });
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status: status as 'DRAFT' | 'PUBLISHED' | 'PRIVATE' | 'ARCHIVED' });
  };

  const handleEdit = (id: string) => {
    navigate(`/success-cases/edit/${id}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={t('common.error')} />;
  }

  const allCases = data?.data || [];
  const filteredCases = statusFilter
    ? allCases.filter((c) => c.status === statusFilter)
    : allCases;

  const totalPages = data?.pagination?.totalPages || 1;
  const draftCount = allCases.filter((c) => c.status === 'DRAFT').length;
  const publishedCount = allCases.filter((c) => c.status === 'PUBLISHED').length;

  return (
    <div className={formStyles.adminContainer}>
      <div className={formStyles.pageHeader}>
        <h1 className={formStyles.pageTitle}>{t('successCases.title')}</h1>
        <Link to="/success-cases/create">
          <button className={formStyles.btnAdd}>+ {t('successCases.add')}</button>
        </Link>
      </div>

      <div className={formStyles.filterBar}>
        <button
          className={formStyles.btnStatus}
          style={!statusFilter ? { backgroundColor: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' } : {}}
          onClick={() => setStatusFilter(undefined)}
        >
          {t('common.all')} ({allCases.length})
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

      {filteredCases.length === 0 ? (
        <div className={formStyles.emptyState}>
          <p>{t('successCases.empty')}</p>
        </div>
      ) : (
        <>
          <div className={formStyles.tableWrapper}>
            <SuccessCaseList
              successCases={filteredCases}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          </div>
          
          {totalPages > 1 && (
            <div className={formStyles.filterBar} style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
              <button
                className={formStyles.btnIcon}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('common.previous')}
              </button>
              <span style={{ padding: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className={formStyles.btnIcon}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.title || ''}
        entityName="caso de éxito"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
