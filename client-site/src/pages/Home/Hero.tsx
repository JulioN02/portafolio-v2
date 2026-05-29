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
      <div className={styles.heroBgImage} aria-hidden="true" />
      <div className={styles.overlay} />
      <div className={styles.pattern} aria-hidden="true">
        <svg className={styles.patternSvg} viewBox="0 0 1200 800" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="150" r="80" fill="rgba(122,203,104,0.06)" />
          <circle cx="1100" cy="200" r="120" fill="rgba(122,203,104,0.04)" />
          <circle cx="600" cy="700" r="180" fill="rgba(122,203,104,0.04)" />
          <circle cx="200" cy="650" r="60" fill="rgba(255,255,255,0.03)" />
          <circle cx="1000" cy="600" r="100" fill="rgba(255,255,255,0.03)" />
          <path d="M0,400 L1200,350 L1200,410 L0,460 Z" fill="rgba(122,203,104,0.03)" />
          <path d="M0,500 L1200,440 L1200,480 L0,540 Z" fill="rgba(255,255,255,0.02)" />
        </svg>
      </div>
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
