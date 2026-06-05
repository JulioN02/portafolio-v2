import DOMPurify from 'dompurify';
import type { BlogPostResponse } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import styles from './BlogPostContent.module.css';

interface BlogPostContentProps {
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

export function BlogPostContent({ post }: BlogPostContentProps) {
  const { t } = useTranslation();
  const sanitizedBody = DOMPurify.sanitize(post.body);
  const sanitizedLessons = post.lessonsLearned
    ? DOMPurify.sanitize(post.lessonsLearned)
    : null;

  const hasMediaGallery =
    Array.isArray(post.mediaGallery) && post.mediaGallery.length > 0;

  return (
    <article className={styles.article}>
      {/* Hero Cover Image */}
      <div className={styles.coverWrapper}>
        <img
          src={post.coverImage}
          alt={post.title}
          className={styles.coverImage}
        />
      </div>

      {/* Header */}
      <header className={styles.header}>
        <span className={styles.category}>{post.category}</span>
        <h1 className={styles.title}>{post.title}</h1>
        <time
          className={styles.date}
          dateTime={String(post.publishedAt ?? post.createdAt)}
        >
          {formatDate(String(post.publishedAt ?? post.createdAt))}
        </time>
      </header>

      {/* Body (sanitized HTML) */}
      <div
        className={styles.body}
        dangerouslySetInnerHTML={{ __html: sanitizedBody }}
      />

      {/* Media Gallery */}
      {hasMediaGallery && (
        <section className={styles.gallerySection}>
          <h2 className={styles.galleryTitle}>{t('blogPostContent.galleryTitle')}</h2>
          <div className={styles.galleryScroll}>
            {post.mediaGallery!.map((url, index) => (
              <img
                key={`${url}-${index}`}
                src={url}
                alt={`${post.title} — imagen ${index + 1}`}
                className={styles.galleryImage}
                loading="lazy"
              />
            ))}
          </div>
        </section>
      )}

      {/* Lessons Learned */}
      {sanitizedLessons && (
        <section className={styles.lessonsSection}>
          <h2 className={styles.lessonsTitle}>{t('blogPostContent.lessonsTitle')}</h2>
          <div
            className={styles.lessonsContent}
            dangerouslySetInnerHTML={{ __html: sanitizedLessons }}
          />
        </section>
      )}

      {/* External Link */}
      {post.externalLink && (
        <div className={styles.externalLinkWrapper}>
          <a
            href={post.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            <span className={styles.externalLinkIcon}>🔗</span>
            {t('blogPostContent.externalLink')}
          </a>
        </div>
      )}
    </article>
  );
}
