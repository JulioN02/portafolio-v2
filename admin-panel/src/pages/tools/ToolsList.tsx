import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loading, ErrorMessage } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTools } from '../../hooks/useTools';
import { ToolList } from '../../components/tools/ToolList';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';
import formStyles from '../../styles/form.module.css';

export function ToolsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { useGetAll, useDelete, useToggleFeatured, useUpdateStatus } = useTools();
  const { data, isLoading, error } = useGetAll();
  const deleteMutation = useDelete();
  const toggleFeaturedMutation = useToggleFeatured();
  const updateStatusMutation = useUpdateStatus();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const handleToggleFeatured = (id: string, featured: boolean) => {
    toggleFeaturedMutation.mutate({ id, featured });
  };

  const handleDelete = (id: string) => {
    const tool = data?.data?.find((t) => t.id === id);
    setDeleteTarget({ id, title: tool?.title || '' });
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status: status as 'DRAFT' | 'PUBLISHED' | 'PRIVATE' | 'ARCHIVED' });
  };

  const allTools = data?.data || [];
  const filteredTools = statusFilter
    ? allTools.filter((t) => t.status === statusFilter)
    : allTools;

  const draftCount = allTools.filter((t) => t.status === 'DRAFT').length;
  const publishedCount = allTools.filter((t) => t.status === 'PUBLISHED').length;

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={t('common.error')} />;

  return (
    <div className={formStyles.adminContainer}>
      <div className={formStyles.pageHeader}>
        <h1 className={formStyles.pageTitle}>{t('tools.title')}</h1>
        <Link to="/tools/create">
          <button className={formStyles.btnAdd}>+ {t('tools.add')}</button>
        </Link>
      </div>

      <div className={formStyles.filterBar}>
        <button
          className={formStyles.btnStatus}
          style={!statusFilter ? { backgroundColor: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' } : {}}
          onClick={() => setStatusFilter(undefined)}
        >
          {t('common.all')} ({allTools.length})
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

      <ToolList
        tools={filteredTools}
        onEdit={(id) => navigate(`/tools/edit/${id}`)}
        onDelete={handleDelete}
        onToggleFeatured={handleToggleFeatured}
        onStatusChange={handleStatusChange}
      />

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.title || ''}
        entityName="herramienta"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
