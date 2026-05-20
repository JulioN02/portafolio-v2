import { Link } from 'react-router-dom';
import { Hero } from '../components/home/Hero';
import { ProfileToggle } from '../components/home/ProfileToggle';
import { TechStack } from '../components/home/TechStack';
import { RecentProjects } from '../components/home/RecentProjects';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <Hero />

      {/* Profile Toggle Section */}
      <ProfileToggle />

      {/* Tech Stack Section */}
      <TechStack />

      {/* Recent Projects Section */}
      <RecentProjects />

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>¿Listo para trabajar juntos?</h2>
          <p className={styles.ctaText}>
            Estoy abierto a nuevas oportunidades laborales y proyectos
            desafiantes. Si buscas un desarrollador comprometido con la calidad
            y los resultados, hablemos.
          </p>
          <Link to="/contacto" className={styles.ctaButton}>
            Contáctame
          </Link>
        </div>
      </section>
    </div>
  );
}
