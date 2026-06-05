import { useSearchParams } from 'react-router-dom';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { BlogCard } from './BlogCard';
import { useTranslation } from '../../i18n/LanguageContext';
import styles from './BlogGrid.module.css';

const ITEMS_PER_PAGE = 9;

interface BlogGridProps {
  category?: string;
  search?: string;
}

export function BlogGrid({ category, search }: BlogGridProps) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const { data, isLoading, isError, error, refetch } = useBlogPosts(page, { category, search });

  const posts = data?.data ?? [];
  const totalItems = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  /** Handle pagination */
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    }, { replace: true });
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
            {t('blogGrid.error')}
          </p>
          <p className={styles.errorDetail}>
            {error instanceof Error ? error.message : t('blogGrid.errorDetail')}
          </p>
          <button
            className={styles.retryButton}
            onClick={() => refetch()}
          >
            {t('blogGrid.retry')}
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
          <p className={styles.emptyMessage}>{t('blogGrid.empty')}</p>
          <p className={styles.emptyDetail}>
            {t('blogGrid.emptyDetail')}
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
            aria-label={t('blogGrid.prevAria')}
          >
            {t('blogGrid.prevPage')}
          </button>

          <div className={styles.pageInfo}>
            {renderPageNumbers(page, totalPages, handlePageChange, t)}
          </div>

          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label={t('blogGrid.nextAria')}
          >
            {t('blogGrid.nextPage')}
          </button>
        </div>
      )}

      {/* Results count */}
      <p className={styles.resultsCount}>
        {totalItems === 1
          ? t('blogGrid.resultsCount.one', { count: totalItems })
          : t('blogGrid.resultsCount.other', { count: totalItems })}
      </p>
    </div>
  );
}

/** Render pagination page numbers with ellipsis for large ranges */
function renderPageNumbers(
  current: number,
  total: number,
  onChange: (page: number) => void,
  t: (key: string, params?: Record<string, string | number>) => string,
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
        aria-label={t('blogGrid.pageAria', { page: p })}
        aria-current={p === current ? 'page' : undefined}
      >
        {p}
      </button>
    ),
  );
}
