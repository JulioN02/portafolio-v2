import { MetaTags } from '../../components/seo/MetaTags';
import { PageHeader } from '../../components/common/PageHeader';
import { ContactForm } from '../../components/forms/ContactForm';
import styles from './Contact.module.css';

export function ContactPage() {
  return (
    <div className={styles.page}>
      <MetaTags
        title="Contacto | J Soft Solutions"
        description="Contáctanos para discutir tu proyecto. Estamos en Bogotá, Colombia."
      />
      <PageHeader
        title="Contacto"
        subtitle="¿Tienes un proyecto en mente? Me encantaría escuchar sobre él."
        backgroundImage="/uploads/contacto.png"
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
                  <h3>Email</h3>
                  <a href="mailto:info@jsoftsolutions.com">info@jsoftsolutions.com</a>
                </div>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailIcon} aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                </span>
                <div>
                  <h3>WhatsApp</h3>
                  <a href="https://wa.me/573001234567">+57 300 123 4567</a>
                </div>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailIcon} aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </span>
                <div>
                  <h3>Ubicación</h3>
                  <p>Bogotá, Colombia</p>
                </div>
              </div>
            </div>

            <div className={styles.availability}>
              <h3>Disponibilidad</h3>
              <p>Lunes a Viernes: 9:00 AM - 6:00 PM (COT)</p>
              <p>Respuesta en menos de 24 horas</p>
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
