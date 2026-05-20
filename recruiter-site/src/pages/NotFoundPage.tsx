import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <p className={styles.code}>404</p>
        <h1 className={styles.message}>Página no encontrada</h1>
        <p className={styles.description}>
          La página que buscas no existe o ha sido movida.
        </p>
        <Link to="/" className={styles.homeButton}>
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
