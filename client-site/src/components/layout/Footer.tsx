import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <h3 className={styles.brandName}>J Soft Solutions</h3>
            <p className={styles.brandTagline}>
              Desarrollo web personalizado para tu negocio
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.links}>
            <h4 className={styles.linksTitle}>Enlaces</h4>
            <nav className={styles.linksNav}>
              <Link to="/">Inicio</Link>
              <Link to="/servicios">Servicios</Link>
              <Link to="/contacto">Contacto</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className={styles.contact}>
            <h4 className={styles.contactTitle}>Contacto</h4>
            <address className={styles.contactInfo}>
              <a href="mailto:info@jsoftsolutions.com">info@jsoftsolutions.com</a>
              <a href="https://wa.me/573001234567">WhatsApp</a>
            </address>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} J Soft Solutions. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
