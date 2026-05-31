import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Loading, ErrorMessage } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSuccessCases } from '../../hooks/useSuccessCases';
import { SuccessCaseList } from '../../components/success-cases/SuccessCaseList';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';

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
    <div>
      <div className="admin-page-header">
        <div>
          <h1>{t('successCases.title')}</h1>
        </div>
        <Link to="/success-cases/create">
          <Button>{t('successCases.add')}</Button>
        </Link>
      </div>

      <div className="admin-filter-bar">
        <Button
          variant={!statusFilter ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter(undefined)}
        >
          {t('common.all')} ({allCases.length})
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

      {filteredCases.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">📋</div>
          <div className="admin-empty-text">{t('successCases.empty')}</div>
        </div>
      ) : (
        <>
          <div className="admin-card">
            <SuccessCaseList
              successCases={filteredCases}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          </div>
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('common.previous')}
              </Button>
              <span style={{ padding: '0.5rem', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t('common.next')}
              </Button>
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
