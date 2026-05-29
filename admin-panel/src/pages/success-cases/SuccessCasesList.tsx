import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Loading, ErrorMessage } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSuccessCases } from '../../hooks/useSuccessCases';
import { SuccessCaseList } from '../../components/success-cases/SuccessCaseList';

export function SuccessCasesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { useGetAll, useDelete, useReorder, useToggleFeatured } = useSuccessCases();
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { data, isLoading, error } = useGetAll({ page, limit });
  const deleteMutation = useDelete();
  const reorderMutation = useReorder();
  const toggleFeaturedMutation = useToggleFeatured();

  const handleToggleFeatured = (id: string, featured: boolean) => {
    toggleFeaturedMutation.mutate({ id, featured });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Error deleting success case:', err);
        alert('Failed to delete success case');
      }
    }
  };

  const handleReorder = async (id: string, newOrder: number) => {
    try {
      await reorderMutation.mutateAsync({ id, order: newOrder });
    } catch (err) {
      console.error('Error reordering success case:', err);
      alert('Failed to reorder success case');
    }
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

  const successCases = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>{t('successCases.title')}</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0' }}>
            💡 {t('tools.reorder')}
          </p>
        </div>
        <Link to="/success-cases/create">
          <Button>{t('successCases.add')}</Button>
        </Link>
      </div>

      {successCases.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">📋</div>
          <div className="admin-empty-text">{t('successCases.empty')}</div>
        </div>
      ) : (
        <>
          <div className="admin-card">
            <SuccessCaseList
              successCases={successCases}
              onReorder={handleReorder}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleFeatured={handleToggleFeatured}
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
    </div>
  );
}
