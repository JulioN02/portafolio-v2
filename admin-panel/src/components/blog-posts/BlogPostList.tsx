import { BlogPostResponse } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import formStyles from '../../styles/form.module.css';
import listStyles from '../shared/ListItem.module.css';

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
    <div className={listStyles.listItem}>
      {posts.map((post) => {
        const badgeClass = statusClassMap[post.status] || statusClassMap.DRAFT;
        return (
          <div key={post.id} className={listStyles.listRow}>
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.title}
                loading="lazy"
                className={listStyles.image}
              />
            )}
            <div className={listStyles.content}>
              <div className={listStyles.titleRow}>
                <p className={listStyles.title}>{post.title}</p>
                  {onStatusChange ? (
                    <select
                      value={post.status}
                      onChange={(e) => handleStatusChange(post.id, e.target.value)}
                      className={`${badgeClass} ${formStyles.statusSelectInline}`}
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
              <p className={listStyles.description}>
                {post.shortDescription.substring(0, 100)}...
              </p>
              <div className={listStyles.meta}>
                {post.category && <span>{post.category} • </span>}
                {formatDate(post.createdAt)}
              </div>
            </div>
            <div className={listStyles.actionsColumn}>
              <button className={formStyles.btnEdit} onClick={() => onEdit(post.id)}>{t('blog.edit')}</button>
              <button className={formStyles.btnDelete} onClick={() => onDelete(post.id)}>{t('blog.delete')}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
