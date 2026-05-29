import { Link } from 'react-router-dom';
import { MetaTags } from '../components/seo/MetaTags';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <MetaTags
        title="404 - Página no encontrada | Julio Nieto"
        noindex
      />
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
