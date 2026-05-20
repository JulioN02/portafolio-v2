import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

// Inline SVG avatar as data URI (avoids external requests during dev)
const avatarPlaceholder =
  'data:image/svg+xml,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="100" fill="#e2e8f0"/>
  <circle cx="100" cy="75" r="35" fill="#94a3b8"/>
  <ellipse cx="100" cy="165" rx="55" ry="45" fill="#94a3b8"/>
</svg>
`);

interface HeroProps {
  name?: string;
  title?: string;
  summary?: string;
  avatarUrl?: string;
}

export function Hero({
  name = 'Julio Nieto',
  title = 'Full Stack Developer',
  summary = 'Desarrollador Full Stack con experiencia en React, Node.js y TypeScript. Apasionado por construir aplicaciones web escalables y de alto rendimiento. Enfocado en crear soluciones que generen valor real para los usuarios y las empresas.',
  avatarUrl = avatarPlaceholder,
}: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.avatarContainer}>
          <img src={avatarUrl} alt={name} className={styles.avatar} />
        </div>
        <h1 className={styles.name}>{name}</h1>
        <p className={styles.title}>{title}</p>
        <p className={styles.summary}>{summary}</p>
        <div className={styles.ctas}>
          <Link to="/proyectos" className={styles.ctaPrimary}>
            Ver Proyectos
          </Link>
          <Link to="/contacto" className={styles.ctaSecondary}>
            Contactar
          </Link>
        </div>
      </div>
    </section>
  );
}
