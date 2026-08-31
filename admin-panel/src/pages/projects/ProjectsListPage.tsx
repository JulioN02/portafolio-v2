import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loading, ErrorMessage } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useProjects } from '../../hooks/useProjects';
import { ProjectTable } from '../../components/projects/ProjectTable';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';
import formStyles from '../../styles/form.module.css';

export function ProjectsListPage() {
  const { t } = useTranslation();
  const [tagFilter, setTagFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { useGetAll, useSoftDelete, useUpdateStatus } = useProjects();
  const { data, isLoading, error } = useGetAll(
    tagFilter ? { tag: tagFilter, page: 1, limit: 50 } : { page: 1, limit: 50 }
  );
  const deleteMutation = useSoftDelete();
  const updateStatusMutation = useUpdateStatus();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const handleDelete = (id: string) => {
    const project = data?.data?.find((p) => p.id === id);
    setDeleteTarget({ id, title: project?.title || '' });
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status: status as 'DRAFT' | 'PUBLISHED' | 'PRIVATE' | 'ARCHIVED' });
  };

  const allProjects = data?.data || [];
  const filteredProjects = statusFilter
    ? allProjects.filter((p) => p.status === statusFilter)
    : allProjects;

  const draftCount = allProjects.filter((p) => p.status === 'DRAFT').length;
  const publishedCount = allProjects.filter((p) => p.status === 'PUBLISHED').length;

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={t('common.error')} />;

  return (
    <div className={formStyles.adminContainer}>
      <div className={formStyles.pageHeader}>
        <h1 className={formStyles.pageTitle}>{t('projects.title')}</h1>
        <Link to="/projects/create">
          <button className={formStyles.btnAdd}>+ {t('projects.add')}</button>
        </Link>
      </div>

      {/* Filter by tag */}
      <div className={formStyles.filterBar}>
        <input
          className={formStyles.filterSearch}
          placeholder={t('projects.filterBy')}
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        />
        <button
          className={formStyles.btnStatus}
          style={!statusFilter ? { backgroundColor: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' } : {}}
          onClick={() => setStatusFilter(undefined)}
        >
          {t('common.all')} ({allProjects.length})
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
        <ProjectTable
          projects={filteredProjects}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </div>

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.title || ''}
        entityName="proyecto"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}