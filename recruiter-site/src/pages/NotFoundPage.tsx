import { Link } from 'react-router-dom';
import { MetaTags } from '../components/seo/MetaTags';
import { useTranslation } from '../i18n/LanguageContext';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <main className={styles.page}>
      <MetaTags
        title={t('notFound.meta.title')}
        noindex
      />
      <div className={styles.content}>
        <p className={styles.code}>{t('notFound.code')}</p>
        <h1 className={styles.message}>{t('notFound.title')}</h1>
        <p className={styles.description}>{t('notFound.description')}</p>
        <Link to="/" className={styles.homeButton}>
          {t('notFound.homeButton')}
        </Link>
      </div>
    </main>
  );
}
