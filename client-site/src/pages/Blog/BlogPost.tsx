import { useParams, Link } from 'react-router-dom';
import { MetaTags } from '../../components/seo/MetaTags';
import { BlogPostContent } from '../../components/blog/BlogPostContent';
import { Spinner } from '../../components/common/Spinner';
import { useBlogPostBySlug } from '../../hooks/useBlogPosts';
import styles from './Blog.module.css';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError } = useBlogPostBySlug(slug ?? '');

  // Loading
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <Spinner />
        </div>
      </div>
    );
  }

  // Error / Not found
  if (isError || !post) {
    return (
      <div className={styles.page}>
        <MetaTags title="Artículo no encontrado | J Soft Solutions" noindex />
        <div className={styles.errorContainer}>
          <h1 className={styles.notFoundTitle}>Artículo no encontrado</h1>
          <p className={styles.notFoundMessage}>
            El artículo que buscas no existe o ha sido eliminado.
          </p>
          <Link to="/blog" className={styles.notFoundLink}>
            ← Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  // Content
  return (
    <div className={styles.page}>
      <MetaTags
        title={`${post.title} | J Soft Solutions`}
        description={post.shortDescription}
        ogType="article"
        publishedTime={post.publishedAt?.toString()}
      />
      <Link to="/blog" className={styles.backLink}>
        ← Volver al blog
      </Link>
      <BlogPostContent post={post} />
    </div>
  );
}
