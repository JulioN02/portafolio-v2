import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { useFeaturedTools } from '../../hooks/useTools';
import { Loading } from '../common/Loading';
import styles from './ToolCarousel.module.css';

export function ToolCarousel() {
  const { t } = useTranslation();
  const { data: tools, isLoading, error } = useFeaturedTools(3);

  if (isLoading) return <Loading message={t('toolCarousel.loading')} />;
  if (error) return <p className={styles.error}>{t('toolCarousel.error')}</p>;
  if (!tools?.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('toolCarousel.title')}</h2>
          <p className={styles.subtitle}>
            {t('toolCarousel.subtitle')}
          </p>
        </div>

        <div className={styles.grid}>
          {tools.map((tool) => (
            <div key={tool.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                {tool.images[0] && (
                  <img 
                    src={tool.images[0]} 
                    alt={tool.title}
                    className={styles.image}
                    loading="lazy"
                  />
                )}
                {tool.requiresInstall && (
                  <span className={styles.badge}>{t('toolCarousel.requiresInstall')}</span>
                )}
              </div>
              <div className={styles.content}>
                <span className={styles.classification}>{tool.classification}</span>
                <h3 className={styles.cardTitle}>{tool.title}</h3>
                <p className={styles.description}>
                  {tool.shortDescription.length > 100 
                    ? `${tool.shortDescription.substring(0, 100)}...` 
                    : tool.shortDescription}
                </p>
                <Link to={`/herramientas/${tool.slug}`} className={styles.link}>
                  {t('toolCarousel.viewDetails')}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <Link to="/herramientas" className={styles.viewAll}>
            {t('toolCarousel.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
}
