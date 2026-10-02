import { Link } from 'react-router-dom';
import { MetaTags } from '../components/seo/MetaTags';
import { buildMetaTitle } from '../components/seo/buildMetaTitle';
import { useTranslation } from '../i18n/LanguageContext';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <main className={styles.page}>
      <MetaTags
        title={buildMetaTitle(t('notFound.meta.title'))}
        noindex
      />
      <div className={styles.content}>
        <p className={styles.code}>{t('notFound.code')}</p>
        <h1 className={styles.message}>{t('notFound.title')}</h1>
        <p className={styles.description}>{t('notFound.description')}</p>
        <div className={styles.actions}><Link to="/" className={styles.homeButton}>{t('notFound.homeButton')}</Link><Link to="/proyectos" className={styles.secondaryButton}>Ver proyectos</Link><Link to="/contacto" className={styles.secondaryButton}>Contactar</Link></div>
      </div>
    </main>
  );
}
