import { useState } from 'react';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { BlogCard } from './BlogCard';
import styles from './BlogGrid.module.css';

const ITEMS_PER_PAGE = 9;

export function BlogGrid() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useBlogPosts(page);

  const posts = data?.data ?? [];
  const totalItems = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  /** Handle pagination */
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.grid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonBody}>
                <div className={styles.skeletonDate} />
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonText} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (isError) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorMessage}>
            No se pudieron cargar los artículos.
          </p>
          <p className={styles.errorDetail}>
            {error instanceof Error ? error.message : 'Error de conexión'}
          </p>
          <button
            className={styles.retryButton}
            onClick={() => refetch()}
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (posts.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <p className={styles.emptyMessage}>No hay artículos publicados aún.</p>
          <p className={styles.emptyDetail}>
            Vuelve pronto para leer las últimas publicaciones.
          </p>
        </div>
      </div>
    );
  }

  // ── Content state ──
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {/* Pagination */}
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
            {renderPageNumbers(page, totalPages, handlePageChange)}
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

      {/* Results count */}
      <p className={styles.resultsCount}>
        {totalItems} artículo{totalItems !== 1 ? 's' : ''} publicado{totalItems !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

/** Render pagination page numbers with ellipsis for large ranges */
function renderPageNumbers(
  current: number,
  total: number,
  onChange: (page: number) => void,
) {
  const pages: (number | 'ellipsis')[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);

    if (current > 3) pages.push('ellipsis');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('ellipsis');

    pages.push(total);
  }

  return pages.map((p, i) =>
    p === 'ellipsis' ? (
      <span key={`ellipsis-${i}`} className={styles.pageEllipsis}>
        &hellip;
      </span>
    ) : (
      <button
        key={p}
        className={`${styles.pageNumber} ${p === current ? styles.pageNumberActive : ''}`}
        onClick={() => onChange(p)}
        aria-label={`Ir a página ${p}`}
        aria-current={p === current ? 'page' : undefined}
      >
        {p}
      </button>
    ),
  );
}
