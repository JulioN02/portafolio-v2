import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { MetaTags } from '../../components/seo/MetaTags';
import { BlogCard } from '../../components/blog/BlogCard';
import { useBlogPosts, useBlogCategories } from '../../hooks/useBlogPosts';
import styles from './Blog.module.css';

const ITEMS_PER_PAGE = 9;

export function BlogPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = Number(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(search || '');

  const { data, isLoading, isError, error, refetch } = useBlogPosts(page, { category, search });
  const { data: categories } = useBlogCategories();

  const posts = data?.data ?? [];
  const totalItems = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  // Debounce search input — update URL search param after 300ms of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchInput) {
          next.set('search', searchInput);
        } else {
          next.delete('search');
        }
        // Reset to page 1 on search change
        next.delete('page');
        return next;
      }, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    }, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set('category', value);
      } else {
        next.delete('category');
      }
      next.delete('page');
      return next;
    }, { replace: true });
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.page}>
        <MetaTags
          title={t('blog.meta.title')}
          description={t('blog.meta.description')}
        />
        <h1 className={styles.title}>{t('blog.title')}</h1>
        <p className={styles.subtitle}>{t('blog.subtitle')}</p>
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
        <MetaTags title={t('blog.meta.title')} noindex />
        <div className={styles.error}>
          <p className={styles.errorMessage}>
            {error instanceof Error ? error.message : t('blog.error.message')}
          </p>
          <button className={styles.retryButton} onClick={() => refetch()}>
            {t('blog.error.retry')}
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    const hasFilters = !!(search || category);
    return (
      <div className={styles.page}>
        <MetaTags
          title={t('blog.meta.title')}
          description={t('blog.meta.description')}
          noindex
        />
        <h1 className={styles.title}>{t('blog.title')}</h1>
        {hasFilters ? (
          <div className={styles.empty}>
            <p className={styles.emptyMessage}>{t('blog.empty.withFilters')}</p>
            <p className={styles.emptySubtitle}>{t('blog.empty.tryDifferent')}</p>
            <button
              className={styles.emptyLink}
              onClick={() => setSearchParams({}, { replace: true })}
            >
              {t('blog.empty.clearFilters')}
            </button>
          </div>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyMessage}>{t('blog.empty.noPosts')}</p>
            <p className={styles.emptySubtitle}>{t('blog.empty.comeBack')}</p>
          </div>
        )}
      </div>
    );
  }

  // Content state
  return (
    <div className={styles.page}>
      <MetaTags
        title={t('blog.meta.title')}
        description={t('blog.meta.description')}
      />
      <h1 className={styles.title}>{t('blog.title')}</h1>
      <p className={styles.subtitle}>{t('blog.subtitle')}</p>

      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder={t('blog.search.placeholder')}
            value={searchInput}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            aria-label={t('blog.search.ariaLabel')}
          />
        </div>

        <select
          className={styles.categorySelect}
          value={category || ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          aria-label={t('blog.filter.ariaLabel')}
        >
          <option value="">{t('blog.filter.allCategories')}</option>
          {categories?.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

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
            aria-label={t('blog.pagination.prevAria')}
          >
            {t('blog.pagination.previous')}
          </button>

          <div className={styles.pageInfo}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`${styles.pageNumber} ${p === page ? styles.pageNumberActive : ''}`}
                onClick={() => handlePageChange(p)}
                aria-label={t('blog.pagination.goToPage', { number: p })}
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
            aria-label={t('blog.pagination.nextAria')}
          >
            {t('blog.pagination.next')}
          </button>
        </div>
      )}
    </div>
  );
}
