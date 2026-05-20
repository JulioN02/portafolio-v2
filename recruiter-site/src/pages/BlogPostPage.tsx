import { useParams, Link } from 'react-router-dom';
import { useBlogPostBySlug } from '../hooks/useBlogPosts';
import { BlogPostContent } from '../components/blog/BlogPostContent';
import styles from './BlogPostPage.module.css';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError, error } = useBlogPostBySlug(slug ?? '');

  // ── Loading state ──
  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.backLink}>
            <Link to="/blog">&larr; Volver al blog</Link>
          </div>
          <div className={styles.loadingState}>
            <div className={styles.skeleton} />
          </div>
        </div>
      </main>
    );
  }

  // ── Error / 404 state ──
  if (isError || !post) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.backLink}>
            <Link to="/blog">&larr; Volver al blog</Link>
          </div>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>🔍</div>
            <h1 className={styles.errorTitle}>Artículo no encontrado</h1>
            <p className={styles.errorMessage}>
              {isError
                ? (error instanceof Error ? error.message : 'Error al cargar el artículo.')
                : 'El artículo que buscas no existe o ha sido eliminado.'}
            </p>
            <Link to="/blog" className={styles.backButton}>
              Ver todos los artículos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Content state ──
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.backLink}>
          <Link to="/blog">&larr; Volver al blog</Link>
        </div>
        <BlogPostContent post={post} />
      </div>
    </main>
  );
}
