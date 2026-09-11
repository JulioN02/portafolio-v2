import { useTranslation } from '../../i18n/LanguageContext';
import { DATA } from './techStack.data';
import styles from './TechStack.module.css';

/**
 * Tech Stack section — 15 technologies grouped in 4 system-layer cards.
 * Static and data-driven (TS-1.1, TS-1.2, TS-2.2): no state, effects, or timers.
 */
export function TechStack() {
  const { t } = useTranslation();

  return (
    <section className={styles.section} aria-labelledby="tech-stack-title">
      <div className={styles.container}>
        <header>
          <h2 id="tech-stack-title" className={styles.title}>
            {t('techStack.title')}
          </h2>
          <p className={styles.subtitle}>{t('techStack.subtitle')}</p>
        </header>

        <div className={styles.grid}>
          {DATA.map((domain) => (
            <article key={domain.id} className={styles.card}>
              <header>
                <h3 className={styles.domainTitle}>{t(domain.titleKey)}</h3>
              </header>
              <ul className={styles.icons}>
                {domain.items.map((item) => (
                  <li key={item.id} className={styles.techItem}>
                    <button
                      type="button"
                      className={styles.techButton}
                      aria-label={t(item.labelKey)}
                    >
                      <item.Icon
                        className={styles.icon}
                        aria-hidden="true"
                        focusable="false"
                      />
                      <span className={styles.techName}>{t(item.labelKey)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
