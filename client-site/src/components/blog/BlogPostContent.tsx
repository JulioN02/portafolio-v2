import { useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import type { BlogPostResponse } from '@jsoft/shared';
import styles from './BlogPostContent.module.css';

interface BlogPostContentProps {
  post: BlogPostResponse;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current && post.body) {
      bodyRef.current.innerHTML = DOMPurify.sanitize(post.body);
    }
  }, [post.body]);

  const date = new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className={styles.article}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.category}>{post.category}</span>
          <span className={styles.date}>{date}</span>
        </div>
        <h1 className={styles.title}>{post.title}</h1>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className={styles.coverWrapper}>
          <img
            src={post.coverImage}
            alt={post.title}
            className={styles.coverImage}
          />
        </div>
      )}

      {/* Body (sanitized HTML) */}
      <div ref={bodyRef} className={styles.body} />

      {/* Media Gallery */}
      {post.mediaGallery && post.mediaGallery.length > 0 && (
        <div className={styles.gallery}>
          <h2 className={styles.galleryTitle}>Galería</h2>
          <div className={styles.galleryGrid}>
            {post.mediaGallery.map((img, i) => (
              <img
                key={`${post.id}-gallery-${i}`}
                src={img}
                alt={`${post.title} - Imagen ${i + 1}`}
                className={styles.galleryImage}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}

      {/* Lessons Learned */}
      {post.lessonsLearned && (
        <section className={styles.lessons}>
          <h2 className={styles.lessonsTitle}>Lecciones aprendidas</h2>
          <div
            className={styles.lessonsContent}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.lessonsLearned) }}
          />
        </section>
      )}

      {/* External Link */}
      {post.externalLink && (
        <div className={styles.externalLink}>
          <a
            href={post.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLinkButton}
          >
            Ver proyecto en GitHub →
          </a>
        </div>
      )}
    </article>
  );
}
