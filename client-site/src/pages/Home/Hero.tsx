import { Link } from 'react-router-dom';
import { PROFILE } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useProjects } from '../../hooks/useProjects';
import styles from './Hero.module.css';

export function Hero() {
  const { t } = useTranslation();
  // limit: 1 → we only need the total count for the "projects delivered" stat.
  const { data: projectsData, isLoading } = useProjects({ filter: { page: 1, limit: 1 } });

  // Truthful count from the API; null while loading or on error (stat hidden).
  const projectsTotal = projectsData?.pagination?.total ?? null;

  return (
    <section className={styles.hero}>
      <div className={styles.heroBgImage} aria-hidden="true" />
      <div className={styles.overlay} />
      <div className={styles.pattern} aria-hidden="true">
        <svg className={styles.patternSvg} viewBox="0 0 1200 800" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="150" r="80" fill="rgba(122,203,104,0.06)" />
          <circle cx="1100" cy="200" r="120" fill="rgba(122,203,104,0.04)" />
          <circle cx="600" cy="700" r="180" fill="rgba(122,203,104,0.04)" />
          <circle cx="200" cy="650" r="60" fill="rgba(255,255,255,0.03)" />
          <circle cx="1000" cy="600" r="100" fill="rgba(255,255,255,0.03)" />
          <path d="M0,400 L1200,350 L1200,410 L0,460 Z" fill="rgba(122,203,104,0.03)" />
          <path d="M0,500 L1200,440 L1200,480 L0,540 Z" fill="rgba(255,255,255,0.02)" />
        </svg>
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>
          {t('hero.title')}
          <span className={styles.highlight}>{t('hero.titleHighlight')}</span>
        </h1>

        <p className={styles.subtitle}>
          {t('hero.subtitle')}
        </p>

        <ul className={styles.stats}>
          <li className={styles.stat}>
            <span className={styles.statValue}>{PROFILE.availabilityMetric}</span>
            <span className={styles.statLabel}>{t('hero.stats.availability')}</span>
          </li>
          <li className={styles.stat}>
            <span className={styles.statValue}>{t('hero.stats.response')}</span>
          </li>
          {isLoading && (
            <li className={styles.stat} role="status">
              <span className={styles.statSkeleton} aria-hidden="true" />
              <span className={styles.statLabel}>{t('hero.stats.projects')}</span>
            </li>
          )}
          {!isLoading && projectsTotal !== null && (
            <li className={styles.stat}>
              <span className={styles.statValue}>{projectsTotal}</span>
              <span className={styles.statLabel}>{t('hero.stats.projects')}</span>
            </li>
          )}
        </ul>

        <div className={styles.ctas}>
          <Link to="/servicios" className={styles.ctaPrimary}>
            {t('hero.cta.services')}
          </Link>
          <a
            href={PROFILE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaWhatsapp}
          >
            {t('hero.cta.whatsapp')}
          </a>
        </div>
      </div>
    </section>
  );
}