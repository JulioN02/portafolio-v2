import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import styles from './ProfileToggle.module.css';

type ProfileMode = 'professional' | 'technical';

export function ProfileToggle() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ProfileMode>('professional');
  const isProfessional = mode === 'professional';

  const professionalText = t('profileToggle.professionalText');
  const technicalText = t('profileToggle.technicalText');

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>{t('profileToggle.sectionTitle')}</h2>

        <div className={styles.toggle}>
          <button
            className={`${styles.toggleBtn} ${isProfessional ? styles.active : ''}`}
            onClick={() => setMode('professional')}
            aria-pressed={isProfessional}
          >
            {t('profileToggle.professional')}
          </button>
          <button
            className={`${styles.toggleBtn} ${!isProfessional ? styles.active : ''}`}
            onClick={() => setMode('technical')}
            aria-pressed={!isProfessional}
          >
            {t('profileToggle.technical')}
          </button>
          <div
            className={styles.toggleIndicator}
            style={{
              transform: isProfessional ? 'translateX(0)' : 'translateX(100%)',
            }}
          />
        </div>

        <div className={styles.contentWrapper}>
          <div
            className={`${styles.content} ${isProfessional ? styles.visible : styles.hidden}`}
          >
            {professionalText.split('\n\n').map((paragraph, i) => (
              <p key={i} className={styles.paragraph}>{paragraph}</p>
            ))}
          </div>
          <div
            className={`${styles.content} ${!isProfessional ? styles.visible : styles.hidden}`}
          >
            {technicalText.split('\n\n').map((paragraph, i) => (
              <p key={i} className={styles.paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
