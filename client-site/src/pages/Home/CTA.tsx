import { Link } from 'react-router-dom';
import styles from './CTA.module.css';

export function CTA() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>¿Tienes un proyecto en mente?</h2>
        <p className={styles.subtitle}>
          Hablemos sobre cómo puedo ayudarte a hacerlo realidad.
        </p>
        <Link to="/contacto" className={styles.button}>
          Contáctame
        </Link>
      </div>
    </section>
  );
}
