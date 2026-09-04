import { PROFILE } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import styles from './ContactStrip.module.css';

export function ContactStrip() {
  const { t } = useTranslation();

  const items = [
    {
      href: `mailto:${PROFILE.email}`,
      label: t('contactStrip.email'),
      value: PROFILE.email,
      external: false,
    },
    {
      href: PROFILE.phoneHref,
      label: t('contactStrip.phone'),
      value: PROFILE.phoneDisplay,
      external: false,
    },
    {
      href: PROFILE.whatsappUrl,
      label: t('contactStrip.whatsapp'),
      external: true,
    },
    {
      href: PROFILE.linkedinUrl,
      label: t('contactStrip.linkedin'),
      external: true,
    },
  ];

  return (
    <section className={styles.section} aria-labelledby="contact-strip-title">
      <div className={styles.container}>
        <h2 className={styles.title} id="contact-strip-title">
          {t('contactStrip.title')}
        </h2>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.label} className={styles.item}>
              <a
                className={styles.link}
                href={item.href}
                {...(item.external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                <span className={styles.linkLabel}>{item.label}</span>
                {item.value && (
                  <span className={styles.linkValue}>{item.value}</span>
                )}
              </a>
            </li>
          ))}
          <li className={styles.item}>
            <a
              className={styles.cvButton}
              href={PROFILE.cvUrl}
              download
              aria-label={t('contactStrip.cvAria')}
            >
              {t('contactStrip.cv')}
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}