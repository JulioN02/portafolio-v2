import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { MetaTags } from '../../components/seo/MetaTags';
import styles from './NotFound.module.css';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <MetaTags
        title={t('notFound.meta.title')}
        noindex
      />
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.code}>404</span>
          <h1 className={styles.title}>{t('notFound.title')}</h1>
          <p className={styles.message}>
            {t('notFound.message')}
          </p>
          <Link to="/" className={styles.button}>
            {t('notFound.goHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
