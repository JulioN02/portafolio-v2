import { SectionTitle } from '../common/SectionTitle';
import { useTranslation } from '../../i18n/LanguageContext';
import styles from './AreasDeAporte.module.css';

/**
 * Contribution areas rendered in order. Titles and descriptions live in i18n
 * (`areasDeAporte.{index}.title` / `.description`) so both languages stay in sync.
 */
const AREA_SLOTS = [0, 1, 2, 3] as const;

export function AreasDeAporte() {
  const { t } = useTranslation();
  const sectionTitle = t('areasDeAporte.title');

  return (
    <section className={styles.section} aria-label={sectionTitle}>
      <div className={styles.container}>
        <SectionTitle title={sectionTitle} />
        <ul className={styles.list}>
          {AREA_SLOTS.map((slot) => (
            <li key={slot} className={styles.item}>
              <h3 className={styles.itemTitle}>{t(`areasDeAporte.${slot}.title`)}</h3>
              <p className={styles.itemDescription}>
                {t(`areasDeAporte.${slot}.description`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
