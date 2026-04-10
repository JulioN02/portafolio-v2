import { Spinner } from './Spinner';
import styles from './Loading.module.css';

interface LoadingProps {
  message?: string;
  fullPage?: boolean;
}

export function Loading({ message = 'Cargando...', fullPage = false }: LoadingProps) {
  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        <Spinner size="lg" />
        <p className={styles.message}>{message}</p>
      </div>
    );
  }

  return (
    <div className={styles.inline}>
      <Spinner size="md" />
      <p className={styles.message}>{message}</p>
    </div>
  );
}
