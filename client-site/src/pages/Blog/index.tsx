import { useState } from 'react';
import { MetaTags } from '../../components/seo/MetaTags';
import { BlogCard } from '../../components/blog/BlogCard';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import styles from './Blog.module.css';

const ITEMS_PER_PAGE = 9;

export function BlogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useBlogPosts(page);

  const posts = data?.data ?? [];
  const totalItems = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.page}>
        <MetaTags
          title="Blog | J Soft Solutions"
          description="Artículos sobre desarrollo web, tecnología y tendencias del sector."
        />
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.subtitle}>Artículos, tutoriales y reflexiones sobre tecnología</p>
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skel-${i}`} className={styles.skeleton}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonBody}>
                <div className={styles.skeletonBadge} />
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonText} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={styles.page}>
        <MetaTags title="Blog | J Soft Solutions" noindex />
        <div className={styles.error}>
          <p className={styles.errorMessage}>
            {error instanceof Error ? error.message : 'No se pudieron cargar los artículos.'}
          </p>
          <button className={styles.retryButton} onClick={() => refetch()}>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className={styles.page}>
        <MetaTags
          title="Blog | J Soft Solutions"
          description="Artículos sobre desarrollo web, tecnología y tendencias del sector."
          noindex
        />
        <h1 className={styles.title}>Blog</h1>
        <div className={styles.empty}>
          <p className={styles.emptyMessage}>No hay artículos publicados aún. Vuelve pronto.</p>
        </div>
      </div>
    );
  }

  // Content state
  return (
    <div className={styles.page}>
      <MetaTags
        title="Blog | J Soft Solutions"
        description="Artículos sobre desarrollo web, tecnología y tendencias del sector."
      />
      <h1 className={styles.title}>Blog</h1>
      <p className={styles.subtitle}>Artículos, tutoriales y reflexiones sobre tecnología</p>

      <div className={styles.grid}>
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
          >
            &laquo; Anterior
          </button>

          <div className={styles.pageInfo}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`${styles.pageNumber} ${p === page ? styles.pageNumberActive : ''}`}
                onClick={() => handlePageChange(p)}
                aria-label={`Ir a página ${p}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Página siguiente"
          >
            Siguiente &raquo;
          </button>
        </div>
      )}
    </div>
  );
}
