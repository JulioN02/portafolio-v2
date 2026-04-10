import { ContactForm } from '../../components/forms/ContactForm';
import styles from './Contact.module.css';

export function ContactPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Info */}
          <div className={styles.info}>
            <h1 className={styles.title}>Contacto</h1>
            <p className={styles.subtitle}>
              ¿Tienes un proyecto en mente? Me encantaría escuchar sobre él.
            </p>

            <div className={styles.details}>
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>📧</span>
                <div>
                  <h3>Email</h3>
                  <a href="mailto:info@jsoftsolutions.com">info@jsoftsolutions.com</a>
                </div>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>📱</span>
                <div>
                  <h3>WhatsApp</h3>
                  <a href="https://wa.me/573001234567">+57 300 123 4567</a>
                </div>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>📍</span>
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
