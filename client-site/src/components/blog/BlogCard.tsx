import { Link } from 'react-router-dom';
import type { BlogPostResponse } from '@jsoft/shared';
import styles from './BlogCard.module.css';

interface BlogCardProps {
  post: BlogPostResponse;
}

export function BlogCard({ post }: BlogCardProps) {
  const date = new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link to={`/blog/${post.slug}`} className={styles.card}>
      {post.coverImage && (
        <div className={styles.imageWrapper}>
          <img
            src={post.coverImage}
            alt={post.title}
            className={styles.image}
            loading="lazy"
          />
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.category}>{post.category}</span>
          <span className={styles.date}>{date}</span>
        </div>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.description}>{post.shortDescription}</p>
      </div>
    </Link>
  );
}
