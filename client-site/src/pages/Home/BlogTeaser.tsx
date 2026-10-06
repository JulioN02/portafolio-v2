import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { useBlogPosts, useFeaturedBlogPosts } from '../../hooks/useBlogPosts';
import { BlogCard } from '../../components/blog/BlogCard';
import styles from './BlogTeaser.module.css';

const TEASER_LIMIT = 3;

export function BlogTeaser() {
  const { t } = useTranslation();
  const featured = useFeaturedBlogPosts(TEASER_LIMIT);
  const recent = useBlogPosts(1, undefined, TEASER_LIMIT);

  // Featured-first, then fill remaining slots with the most recent posts.
  const merged = [...(featured.data ?? [])];
  for (const post of recent.data?.data ?? []) {
    if (merged.length >= TEASER_LIMIT) break;
    if (!merged.some((existing) => existing.id === post.id)) {
      merged.push(post);
    }
  }
  const posts = merged.slice(0, TEASER_LIMIT);

  const isLoading = posts.length === 0 && (featured.isLoading || recent.isLoading);

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.title}>{t('blogTeaser.title')}</h2>
          <div className={styles.skeletonGrid} role="status" aria-label={t('blogTeaser.loading')}>
            {Array.from({ length: TEASER_LIMIT }, (_, i) => (
              <div key={i} className={styles.skeletonCard} aria-hidden="true" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty or error → hide the whole section (no layout break, no crash).
  if (posts.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('blogTeaser.title')}</h2>
          <Link to="/blog" className={styles.viewAll}>
            {t('blogTeaser.viewAll')}
          </Link>
        </div>
        <div className={styles.grid}>
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
