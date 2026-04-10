import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.code}>404</span>
          <h1 className={styles.title}>Página no encontrada</h1>
          <p className={styles.message}>
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          <Link to="/" className={styles.button}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
