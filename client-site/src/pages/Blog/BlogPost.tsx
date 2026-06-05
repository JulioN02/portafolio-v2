import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { MetaTags } from '../../components/seo/MetaTags';
import { BlogPostContent } from '../../components/blog/BlogPostContent';
import { Spinner } from '../../components/common/Spinner';
import { useBlogPostBySlug } from '../../hooks/useBlogPosts';
import styles from './Blog.module.css';

export function BlogPostPage() {
  const { t } = useTranslation();
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
        <MetaTags title={t('blogPost.meta.notFound')} noindex />
        <div className={styles.errorContainer}>
          <h1 className={styles.notFoundTitle}>{t('blogPost.notFound.title')}</h1>
          <p className={styles.notFoundMessage}>
            {t('blogPost.notFound.message')}
          </p>
          <Link to="/blog" className={styles.notFoundLink}>
            {t('blogPost.backToBlog')}
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
        {t('blogPost.backToBlog')}
      </Link>
      <BlogPostContent post={post} />
    </div>
  );
}
