import { useNavigate } from 'react-router-dom';
import type { BlogPostResponse } from '@jsoft/shared';
import styles from './BlogCard.module.css';

interface BlogCardProps {
  post: BlogPostResponse;
}

/**
 * Formats a date string to Spanish locale (es-ES).
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function BlogCard({ post }: BlogCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/blog/${post.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`Leer artículo: ${post.title}`}
    >
      <div className={styles.imageWrapper}>
        <img
          src={post.coverImage}
          alt={post.title}
          className={styles.image}
          loading="lazy"
        />
        <span className={styles.categoryBadge}>{post.category}</span>
      </div>

      <div className={styles.body}>
        <time className={styles.date} dateTime={String(post.publishedAt ?? post.createdAt)}>
          {formatDate(String(post.publishedAt ?? post.createdAt))}
        </time>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.shortDescription}>{post.shortDescription}</p>
      </div>
    </article>
  );
}
