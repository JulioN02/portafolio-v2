import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToolBySlug } from '../../hooks/useTools';
import { Loading } from '../../components/common/Loading';
import { MetaTags } from '../../components/seo/MetaTags';
import { ToolDetailModal } from '../../components/tools/ToolDetailModal';
import styles from './ToolDetail.module.css';

export function ToolDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: tool, isLoading, error } = useToolBySlug(slug || '');

  if (isLoading) return <Loading fullPage message={t('toolDetail.loading')} />;

  if (error || !tool) {
    return (
      <div className={styles.error}>
        <h2>{t('toolDetail.notFound.title')}</h2>
        <p>{t('toolDetail.notFound.message')}</p>
        <Link to="/herramientas" className={styles.backLink}>
          {t('toolDetail.backToTools')}
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <MetaTags
        title={`${tool.title} | J Soft Solutions`}
        description={tool.shortDescription}
      />
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/herramientas">{t('toolDetail.breadcrumb.tools')}</Link>
          <span>/</span>
          <span>{tool.title}</span>
        </nav>

        {/* Prominent back link at the top */}
        <Link to="/herramientas" className={styles.backLink}>
          {t('toolDetail.backToTools')}
        </Link>

        {/* The SAME shared modal component renders inline, expanded by default.
            No auto-open overlay, no redirect — the deep-link just shows content. */}
        <ToolDetailModal tool={tool} initialExpanded />
      </div>
    </div>
  );
}