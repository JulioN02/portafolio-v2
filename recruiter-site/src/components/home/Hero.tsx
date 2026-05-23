import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

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
  avatarUrl,
}: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.pattern} aria-hidden="true">
        <svg className={styles.patternSvg} viewBox="0 0 1200 800" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="100" r="60" fill="rgba(122,203,104,0.06)" />
          <circle cx="1120" cy="150" r="100" fill="rgba(122,203,104,0.04)" />
          <circle cx="600" cy="650" r="150" fill="rgba(122,203,104,0.04)" />
          <circle cx="200" cy="700" r="50" fill="rgba(255,255,255,0.03)" />
          <circle cx="1000" cy="500" r="80" fill="rgba(255,255,255,0.03)" />
        </svg>
      </div>
      <div className={styles.content}>
        <div className={styles.avatarContainer}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="35" r="18" fill="rgba(255,255,255,0.3)" />
                <ellipse cx="50" cy="82" rx="32" ry="22" fill="rgba(255,255,255,0.2)" />
              </svg>
            </div>
          )}
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
