import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Loading, ErrorMessage } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTools } from '../../hooks/useTools';
import { ToolList } from '../../components/tools/ToolList';

export function ToolsListPage() {
  const { t } = useTranslation();
  const { useGetAll, useDelete, useReorder } = useTools();
  const { data, isLoading, error } = useGetAll();
  const deleteMutation = useDelete();
  const reorderMutation = useReorder();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteMutation.mutate(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const handleReorder = (items: { id: string; order: number }[]) => {
    // Send each item's new order via the API sequentially
    items.forEach(({ id, order }) => {
      reorderMutation.mutate({ id, order });
    });
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={t('common.error')} />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>{t('tools.title')}</h1>
        <Link to="/tools/create">
          <Button>{t('tools.add')}</Button>
        </Link>
      </div>
      
      <div className="admin-card" style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--color-primary-50)', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-primary-700)', margin: 0 }}>
          💡 {t('tools.reorder')}
        </p>
      </div>

      <ToolList
        tools={(data?.data || []).map(t => ({ ...t, order: t.order || 0 }))}
        onReorder={handleReorder}
        onEdit={(id) => window.location.href = `/tools/edit/${id}`}
        onDelete={handleDelete}
      />
    </div>
  );
}
