import styles from './ErrorBoundary.module.css';

export interface ErrorFallbackProps {
  onReset?: () => void;
  title?: string;
  message?: string;
}

export function ErrorFallback({
  onReset,
  title = 'Algo salió mal',
  message = 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
}: ErrorFallbackProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        {onReset && (
          <button className={styles.retryButton} onClick={onReset}>
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
