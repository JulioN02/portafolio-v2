import { Link } from 'react-router-dom';
import { PROFILE } from '@jsoft/shared';
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
        <div className={styles.actions}>
          <a href={PROFILE.phoneHref} className={styles.action}>
            <span className={styles.actionLabel}>{t('cta.phone')}</span>
            <span className={styles.actionValue}>{PROFILE.phoneDisplay}</span>
          </a>
          <a
            href={PROFILE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.action} ${styles.actionWhatsapp}`}
          >
            {t('cta.whatsapp')}
          </a>
          <Link to="/contacto" className={styles.button} aria-label={t('cta.form')}>
            {t('cta.button')}
          </Link>
        </div>
      </div>
    </section>
  );
}