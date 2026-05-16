import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@jsoft/shared';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { BlogPostList } from '../../components/blog-posts/BlogPostList';

export function BlogPostsListPage() {
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

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>Error loading posts</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Blog Posts</h1>
        <Link to="/blog-posts/create">
          <Button>Create Post</Button>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '0.5rem 1rem',
            background: filter === 'all' ? '#3b82f6' : '#f3f4f6',
            color: filter === 'all' ? '#fff' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          All ({allPosts.length})
        </button>
        <button
          onClick={() => setFilter('PUBLISHED')}
          style={{
            padding: '0.5rem 1rem',
            background: filter === 'PUBLISHED' ? '#10b981' : '#f3f4f6',
            color: filter === 'PUBLISHED' ? '#fff' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Published ({publishedCount})
        </button>
        <button
          onClick={() => setFilter('DRAFT')}
          style={{
            padding: '0.5rem 1rem',
            background: filter === 'DRAFT' ? '#f59e0b' : '#f3f4f6',
            color: filter === 'DRAFT' ? '#fff' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Drafts ({draftCount})
        </button>
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