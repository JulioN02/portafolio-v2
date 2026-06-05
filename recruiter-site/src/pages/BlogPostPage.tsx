import { lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogPostBySlug } from '../hooks/useBlogPosts';
import { MetaTags } from '../components/seo/MetaTags';
import { useTranslation } from '../i18n/LanguageContext';
import styles from './BlogPostPage.module.css';

const BlogPostContent = lazy(() => import('../components/blog/BlogPostContent').then(m => ({ default: m.BlogPostContent })));

export function BlogPostPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError, error } = useBlogPostBySlug(slug ?? '');

  // ── Loading state ──
  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.backLink}>
            <Link to="/blog">{t('blogPost.backLink')}</Link>
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
            <Link to="/blog">{t('blogPost.backLink')}</Link>
          </div>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>🔍</div>
            <h1 className={styles.errorTitle}>{t('blogPost.notFound.title')}</h1>
            <p className={styles.errorMessage}>
              {isError
                ? (error instanceof Error ? error.message : t('blogPost.error.message'))
                : t('blogPost.notFound.message')}
            </p>
            <Link to="/blog" className={styles.backButton}>
              {t('blogPost.viewAll')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Content state ──
  return (
    <main className={styles.page}>
      <MetaTags
        title={`${post.title} | Julio Nieto`}
        description={post.shortDescription}
        ogType="article"
        publishedTime={post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt ?? undefined}
      />
      <div className={styles.container}>
        <div className={styles.backLink}>
          <Link to="/blog">{t('blogPost.backLink')}</Link>
        </div>
        <Suspense fallback={<div className={styles.loadingState}><div className={styles.skeleton} /></div>}>
          <BlogPostContent post={post} />
        </Suspense>
      </div>
    </main>
  );
}
