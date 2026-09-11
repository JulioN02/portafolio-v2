import { useTranslation } from '../../i18n/LanguageContext';
import { MetaTags } from '../../components/seo/MetaTags';
import { PageHeader } from '../../components/common/PageHeader';
import { ContactForm } from '../../components/forms/ContactForm';
import { PROFILE } from '@jsoft/shared';
import styles from './Contact.module.css';

export function ContactPage() {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <MetaTags
        title={t('contact.meta.title')}
        description={t('contact.meta.description')}
      />
      <PageHeader
        title={t('contact.pageHeader.title')}
        subtitle={t('contact.pageHeader.subtitle')}
        backgroundImage="/images/contacto.png"
      />
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Info */}
          <div className={styles.info}>

            <div className={styles.details}>
              <div className={styles.detailItem}>
                <span className={styles.detailIcon} aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </span>
                <div>
                  <h3>{t('contact.email')}</h3>
                  <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
                </div>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailIcon} aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </span>
                <div>
                  <h3>{t('contact.location')}</h3>
                  <p>{t('contact.locationValue')}</p>
                </div>
              </div>
            </div>

            <div className={styles.availability}>
              <h3>{t('contact.availability.title')}</h3>
              <p>{t('contact.availability.schedule')}</p>
              <p>{t('contact.availability.response')}</p>
            </div>
          </div>

          {/* Form */}
          <div className={styles.formWrapper}>
            <ContactForm source="contact-page" />
          </div>
        </div>
      </div>
    </div>
  );
}
