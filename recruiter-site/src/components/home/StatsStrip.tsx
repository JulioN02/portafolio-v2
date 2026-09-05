import { PROFILE } from '@jsoft/shared';
import { techStack } from '../../data/tech-stack';
import { useTranslation } from '../../i18n/LanguageContext';
import styles from './StatsStrip.module.css';

/**
 * Years as National Logistics Coordinator (Ene 2018 – Ene 2025),
 * traceable to the timeline entry in translations (RHP-5: no invented metrics).
 */
const LOGISTICS_YEARS = 7;
/** English level from the timeline languages line (Español nativo / Inglés A2). */
const ENGLISH_LEVEL = 'A2';

export function StatsStrip() {
  const { t } = useTranslation();
  const techCount = techStack.reduce((acc, group) => acc + group.items.length, 0);

  const stats = [
    { value: PROFILE.availabilityMetric, label: t('statsStrip.availability') },
    { value: String(LOGISTICS_YEARS), label: t('statsStrip.logisticsYears') },
    { value: String(techCount), label: t('statsStrip.techCount') },
    { value: ENGLISH_LEVEL, label: t('statsStrip.englishLevel') },
  ];

  return (
    <section className={styles.section} aria-labelledby="stats-strip-title">
      <div className={styles.container}>
        <h2 className={styles.title} id="stats-strip-title">
          {t('statsStrip.title')}
        </h2>
        <dl className={styles.list}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.item}>
              <dt className={styles.label}>{stat.label}</dt>
              <dd className={styles.value}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}