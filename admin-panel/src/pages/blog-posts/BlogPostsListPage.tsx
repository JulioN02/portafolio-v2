import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loading, ErrorMessage } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { BlogPostList } from '../../components/blog-posts/BlogPostList';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';
import formStyles from '../../styles/form.module.css';

export function BlogPostsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { useGetAll, useDelete, useUpdateStatus } = useBlogPosts();
  const { data, isLoading, error } = useGetAll();
  const deleteMutation = useDelete();
  const updateStatusMutation = useUpdateStatus();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'DRAFT' | 'PUBLISHED'>('all');

  const handleDelete = (id: string) => {
    const post = data?.data?.find((p) => p.id === id);
    setDeleteTarget({ id, title: post?.title || '' });
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus as 'DRAFT' | 'PUBLISHED' | 'PRIVATE' | 'ARCHIVED' });
  };

  const allPosts = data?.data || [];
  const filteredPosts = filter === 'all' 
    ? allPosts 
    : allPosts.filter((p) => p.status === filter);

  const draftCount = allPosts.filter((p) => p.status === 'DRAFT').length;
  const publishedCount = allPosts.filter((p) => p.status === 'PUBLISHED').length;

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={t('common.error')} />;

  return (
    <div className={formStyles.adminContainer}>
      <div className={formStyles.pageHeader}>
        <h1 className={formStyles.pageTitle}>{t('blog.title')}</h1>
        <Link to="/blog-posts/create">
          <button className={formStyles.btnAdd}>+ {t('blog.add')}</button>
        </Link>
      </div>

      <div className={formStyles.filterBar}>
        <button
          className={formStyles.btnStatus}
          style={filter === 'all' ? { backgroundColor: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' } : {}}
          onClick={() => setFilter('all')}
        >
          {t('common.all')} ({allPosts.length})
        </button>
        <button
          className={formStyles.btnStatus}
          style={filter === 'PUBLISHED' ? { backgroundColor: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' } : {}}
          onClick={() => setFilter('PUBLISHED')}
        >
          {t('blog.published')} ({publishedCount})
        </button>
        <button
          className={formStyles.btnStatus}
          style={filter === 'DRAFT' ? { backgroundColor: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' } : {}}
          onClick={() => setFilter('DRAFT')}
        >
          {t('blog.drafts')} ({draftCount})
        </button>
      </div>

      <div className={formStyles.tableWrapper}>
        <BlogPostList
          posts={filteredPosts}
          onEdit={(id) => navigate(`/blog-posts/edit/${id}`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </div>

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.title || ''}
        entityName="artículo"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
