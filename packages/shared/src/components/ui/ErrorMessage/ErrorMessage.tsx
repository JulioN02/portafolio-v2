/**
 * Error message component with optional retry action
 *
 * NOTE: Class names defined inline — CSS module maps are stripped by tsup.
 */
import type { ReactNode } from 'react';

const styles = {
  container: 'container',
  icon: 'icon',
  message: 'message',
  content: 'content',
  retryButton: 'retryButton',
};

export interface ErrorMessageProps {
  /** Error message to display */
  message: string;
  /** Optional retry callback — renders a retry button if provided */
  onRetry?: () => void;
  /** Additional content below the message */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
}

export function ErrorMessage({
  message,
  onRetry,
  children,
  className,
}: ErrorMessageProps) {
  const classNames = [styles.container, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} role="alert">
      <div className={styles.icon} aria-hidden="true">
        !
      </div>
      <p className={styles.message}>{message}</p>
      {children && <div className={styles.content}>{children}</div>}
      {onRetry && (
        <button
          type="button"
          className={styles.retryButton}
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
}
