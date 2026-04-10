/**
 * Loading spinner component
 */
import styles from './Loading.module.css';

export interface LoadingProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label */
  label?: string;
  /** Additional CSS class */
  className?: string;
}

export function Loading({ size = 'md', label = 'Loading...', className }: LoadingProps) {
  const classNames = [styles.spinner, styles[size], className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.container} role="status" aria-label={label}>
      <div className={classNames} aria-hidden="true" />
      <span className={styles.srOnly}>{label}</span>
    </div>
  );
}
