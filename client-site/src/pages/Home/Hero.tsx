import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

const BADGES = [
  'Desarrollo Web',
  'UI/UX Design',
  'Consultoría',
  'Apps Móviles',
];

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.badges}>
          {BADGES.map((badge) => (
            <span key={badge} className={styles.badge}>
              {badge}
            </span>
          ))}
        </div>

        <h1 className={styles.title}>
          Desarrollo Web{' '}
          <span className={styles.highlight}>Personalizado</span>
        </h1>

        <p className={styles.subtitle}>
          Transformo tus ideas en soluciones digitales que impulsan tu negocio.
          Desde sitios web hasta aplicaciones complejas.
        </p>

        <div className={styles.ctas}>
          <Link to="/servicios" className={styles.ctaPrimary}>
            Ver Servicios
          </Link>
          <Link
            to="https://wa.me/573001234567"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaWhatsapp}
          >
            Escríbeme por WhatsApp
          </Link>
        </div>
      </div>
    </section>
  );
}
