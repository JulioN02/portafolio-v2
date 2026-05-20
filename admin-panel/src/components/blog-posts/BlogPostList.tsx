import { BlogPostResponse } from '@jsoft/shared';

interface BlogPostListProps {
  posts: BlogPostResponse[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
}

export function BlogPostList({ posts, onEdit, onDelete, onStatusChange }: BlogPostListProps) {

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStatusChange = (postId: string, newStatus: string) => {
    onStatusChange?.(postId, newStatus);
  };

  const statusColors: Record<string, { bg: string; color: string }> = {
    DRAFT: { bg: '#fef3c7', color: '#92400e' },
    PUBLISHED: { bg: '#d1fae5', color: '#065f46' },
    PRIVATE: { bg: '#dbeafe', color: '#1e40af' },
    ARCHIVED: { bg: '#f3f4f6', color: '#6b7280' },
  };

  if (posts.length === 0) {
    return <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No blog posts found</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {posts.map((post) => {
        const sc = statusColors[post.status] || statusColors.DRAFT;
        return (
          <div
            key={post.id}
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.title}
                style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <p style={{ fontWeight: '600', margin: 0 }}>{post.title}</p>
                {onStatusChange ? (
                  <select
                    value={post.status}
                    onChange={(e) => handleStatusChange(post.id, e.target.value)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      background: sc.bg,
                      color: sc.color,
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="PRIVATE">PRIVATE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                ) : (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      background: sc.bg,
                      color: sc.color,
                    }}
                  >
                    {post.status}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>
                {post.shortDescription.substring(0, 100)}...
              </p>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                {post.category && <span>{post.category} • </span>}
                {formatDate(post.createdAt)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => onEdit(post.id)}
                style={{ padding: '0.25rem 0.75rem', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(post.id)}
                style={{ padding: '0.25rem 0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}