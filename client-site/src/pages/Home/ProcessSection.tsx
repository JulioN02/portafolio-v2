import { useTranslation } from '../../i18n/LanguageContext';
import styles from './ProcessSection.module.css';

const STEP_KEYS = [
  'processSection.step1',
  'processSection.step2',
  'processSection.step3',
  'processSection.step4',
] as const;

const WHY_KEYS = [
  'processSection.whyMe.1',
  'processSection.whyMe.2',
  'processSection.whyMe.3',
] as const;

export function ProcessSection() {
  const { t } = useTranslation();

  return (
    <section className={styles.section} aria-labelledby="process-title">
      <div className={styles.container}>
        <h2 className={styles.title} id="process-title">
          {t('processSection.title')}
        </h2>

        <ol className={styles.steps}>
          {STEP_KEYS.map((key, index) => (
            <li key={key} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <span className={styles.stepText}>{t(key)}</span>
            </li>
          ))}
        </ol>

        <h3 className={styles.whyTitle}>{t('processSection.whyMe.title')}</h3>
        <ul className={styles.whyList}>
          {WHY_KEYS.map((key) => (
            <li key={key} className={styles.whyItem}>
              {t(key)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}