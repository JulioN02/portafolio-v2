import { useTranslation } from '../../i18n/LanguageContext';
import styles from './StatsStrip.module.css';

/**
 * Metric slots rendered in order. Values and labels live in i18n
 * (`statsStrip.{index}.value` / `.label`) so both languages stay in sync
 * and the component carries no hardcoded content.
 */
const METRIC_SLOTS = [0, 1, 2, 3] as const;

export function StatsStrip() {
  const { t } = useTranslation();

  return (
    <section className={styles.section} aria-labelledby="stats-strip-title">
      <div className={styles.container}>
        <h2 className={styles.title} id="stats-strip-title">
          {t('statsStrip.title')}
        </h2>
        <dl className={styles.list}>
          {METRIC_SLOTS.map((slot) => {
            const label = t(`statsStrip.${slot}.label`);
            return (
              <div key={slot} className={styles.item}>
                <dt className={styles.label}>{label}</dt>
                <dd className={styles.value}>{t(`statsStrip.${slot}.value`)}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
