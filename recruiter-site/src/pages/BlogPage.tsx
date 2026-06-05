import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MetaTags } from '../components/seo/MetaTags';
import { BlogGrid } from '../components/blog/BlogGrid';
import { useBlogCategories } from '../hooks/useBlogPosts';
import { useTranslation } from '../i18n/LanguageContext';
import styles from './BlogPage.module.css';

export function BlogPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;

  const [searchInput, setSearchInput] = useState(search || '');
  const { data: categories } = useBlogCategories();

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
        next.delete('page');
        return next;
      }, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setSearchParams]);

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

  return (
    <main>
      <MetaTags
        title={t('blog.meta.title')}
        description={t('blog.meta.description')}
      />
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder={t('blog.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label={t('blog.searchAriaLabel')}
          />
        </div>

        <select
          className={styles.categorySelect}
          value={category || ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          aria-label={t('blog.categoryAriaLabel')}
        >
          <option value="">{t('blog.categoryAll')}</option>
          {categories?.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <BlogGrid category={category} search={search} />
    </main>
  );
}
