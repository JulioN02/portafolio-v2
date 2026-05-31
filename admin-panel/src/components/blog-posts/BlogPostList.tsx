import { BlogPostResponse } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import formStyles from '../../styles/form.module.css';

interface BlogPostListProps {
  posts: BlogPostResponse[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
}

export function BlogPostList({ posts, onEdit, onDelete, onStatusChange }: BlogPostListProps) {
  const { t } = useTranslation();

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

  const statusClassMap: Record<string, string> = {
    DRAFT: formStyles.badgeDraft,
    PUBLISHED: formStyles.badgePublished,
    PRIVATE: formStyles.badgePrivate,
    ARCHIVED: formStyles.badgeArchived,
  };

  if (posts.length === 0) {
    return (
      <div className={formStyles.emptyState}>
        <p>{t('blog.empty')}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
      {posts.map((post) => {
        const badgeClass = statusClassMap[post.status] || statusClassMap.DRAFT;
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
                loading="lazy"
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
                    className={badgeClass}
                    style={{ border: 'none', cursor: 'pointer', appearance: 'none' }}
                  >
                    <option value="DRAFT">{t('blog.draft')}</option>
                    <option value="PUBLISHED">{t('blog.published')}</option>
                    <option value="PRIVATE">{t('blog.private')}</option>
                    <option value="ARCHIVED">{t('blog.archived')}</option>
                  </select>
                ) : (
                  <span className={badgeClass}>
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
              <button className={formStyles.btnEdit} onClick={() => onEdit(post.id)}>{t('blog.edit')}</button>
              <button className={formStyles.btnDelete} onClick={() => onDelete(post.id)}>{t('blog.delete')}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
