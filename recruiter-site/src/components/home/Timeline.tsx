import { useTranslation } from '../../i18n/LanguageContext';
import styles from './Timeline.module.css';

interface TimelineEntry {
  roleKey: string;
  orgKey: string;
  periodKey?: string;
  dateTimeKey?: string;
  metricKey?: string;
}

// Experience entries in chronological order (RHP-3).
// Soporte Movexa and Operador Homecenter have no dates in the design/CV —
// they render without a <time> element (no invented dates).
const EXPERIENCE: TimelineEntry[] = [
  {
    roleKey: 'timeline.exp.0.role',
    orgKey: 'timeline.exp.0.org',
    periodKey: 'timeline.exp.0.period',
    dateTimeKey: 'timeline.exp.0.dateTime',
  },
  {
    roleKey: 'timeline.exp.1.role',
    orgKey: 'timeline.exp.1.org',
    periodKey: 'timeline.exp.1.period',
    dateTimeKey: 'timeline.exp.1.dateTime',
    metricKey: 'timeline.exp.1.metric',
  },
  { roleKey: 'timeline.exp.2.role', orgKey: 'timeline.exp.2.org' },
  { roleKey: 'timeline.exp.3.role', orgKey: 'timeline.exp.3.org' },
];

const EDUCATION: TimelineEntry[] = [
  {
    roleKey: 'timeline.edu.0.role',
    orgKey: 'timeline.edu.0.org',
    periodKey: 'timeline.edu.0.period',
    dateTimeKey: 'timeline.edu.0.dateTime',
  },
  {
    roleKey: 'timeline.edu.1.role',
    orgKey: 'timeline.edu.1.org',
    periodKey: 'timeline.edu.1.period',
    dateTimeKey: 'timeline.edu.1.dateTime',
  },
  {
    roleKey: 'timeline.edu.2.role',
    orgKey: 'timeline.edu.2.org',
    periodKey: 'timeline.edu.2.period',
    dateTimeKey: 'timeline.edu.2.dateTime',
  },
];

export function Timeline() {
  const { t } = useTranslation();

  const renderEntry = (entry: TimelineEntry) => {
    const period = entry.periodKey ? t(entry.periodKey) : undefined;
    const dateTime = entry.dateTimeKey ? t(entry.dateTimeKey) : undefined;
    return (
      <li key={entry.roleKey} className={styles.item}>
        {period && (
          <time className={styles.period} dateTime={dateTime}>
            {period}
          </time>
        )}
        <h3 className={styles.role}>{t(entry.roleKey)}</h3>
        <p className={styles.org}>{t(entry.orgKey)}</p>
        {entry.metricKey && <p className={styles.metric}>{t(entry.metricKey)}</p>}
      </li>
    );
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.columns}>
          <div className={styles.column}>
            <h2 className={styles.columnTitle}>{t('timeline.experienceTitle')}</h2>
            <ol className={styles.list}>{EXPERIENCE.map(renderEntry)}</ol>
          </div>
          <div className={styles.column}>
            <h2 className={styles.columnTitle}>{t('timeline.educationTitle')}</h2>
            <ol className={styles.list}>{EDUCATION.map(renderEntry)}</ol>
            <h2 className={styles.columnTitle}>{t('timeline.languagesTitle')}</h2>
            <p className={styles.languages}>{t('timeline.languages')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}