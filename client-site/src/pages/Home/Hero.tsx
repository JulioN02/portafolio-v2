import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Desarrollo Web
          <span className={styles.highlight}> Personalizado</span>
        </h1>
        <p className={styles.subtitle}>
          Transformo tus ideas en soluciones digitales que impulsan tu negocio.
          Desde sitios web hasta aplicaciones complejas.
        </p>
        <div className={styles.actions}>
          <Link to="/servicios" className={styles.primaryButton}>
            Ver Servicios
          </Link>
          <Link to="/contacto" className={styles.secondaryButton}>
            Contactar
          </Link>
        </div>
      </div>
    </section>
  );
}
