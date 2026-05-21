import { Link } from 'react-router-dom';
import { MetaTags } from '../components/seo/MetaTags';
import { Hero } from '../components/home/Hero';
import { ProfileToggle } from '../components/home/ProfileToggle';
import { TechStack } from '../components/home/TechStack';
import { RecentProjects } from '../components/home/RecentProjects';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <div className={styles.page}>
      <MetaTags
        title="Julián Naranjo | Desarrollador Full Stack"
        description="Desarrollador Full Stack especializado en React, Node.js y TypeScript. Conoce mi portafolio y experiencia."
      />
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
