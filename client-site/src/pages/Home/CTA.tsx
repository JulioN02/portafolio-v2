import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import styles from './CTA.module.css';

export function CTA() {
  const { t } = useTranslation();
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t('cta.title')}</h2>
        <p className={styles.subtitle}>
          {t('cta.subtitle')}
        </p>
        <Link to="/contacto" className={styles.button}>
          {t('cta.button')}
        </Link>
      </div>
    </section>
  );
}
