import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Loading, ErrorMessage } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { BlogPostList } from '../../components/blog-posts/BlogPostList';

export function BlogPostsListPage() {
  const { t } = useTranslation();
  const { useGetAll, useDelete, useUpdateStatus } = useBlogPosts();
  const { data, isLoading, error } = useGetAll();
  const deleteMutation = useDelete();
  const updateStatusMutation = useUpdateStatus();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'DRAFT' | 'PUBLISHED'>('all');

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteMutation.mutate(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
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
    <div>
      <div className="admin-page-header">
        <h1>{t('blog.title')}</h1>
        <Link to="/blog-posts/create">
          <Button>{t('blog.add')}</Button>
        </Link>
      </div>

      <div className="admin-filter-bar">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          {t('common.all')} ({allPosts.length})
        </Button>
        <Button
          variant={filter === 'PUBLISHED' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('PUBLISHED')}
        >
          {t('blog.published')} ({publishedCount})
        </Button>
        <Button
          variant={filter === 'DRAFT' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('DRAFT')}
        >
          {t('blog.drafts')} ({draftCount})
        </Button>
      </div>

      <BlogPostList
        posts={filteredPosts}
        onEdit={(id) => (window.location.href = `/blog-posts/edit/${id}`)}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
