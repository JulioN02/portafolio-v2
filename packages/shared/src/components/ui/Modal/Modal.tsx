/**
 * Modal component with overlay, close on backdrop click, and ESC key
 *
 * NOTE: Class names are defined inline instead of CSS module import
 * because tsup strips CSS module mappings during build.
 * The corresponding styles live in Modal.module.css and are bundled
 * into dist/index.css — import '@jsoft/shared/dist/index.css' to load them.
 */
import { useEffect, useCallback, type ReactNode } from 'react';

const styles = {
  overlay: 'overlay',
  modal: 'modal',
  header: 'header',
  title: 'title',
  closeButton: 'closeButton',
  body: 'body',
};

export interface ModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Optional title displayed in modal header */
  title?: string;
  /** Modal body content */
  children: ReactNode;
  /** Additional CSS class on the modal container */
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const modalClassNames = [styles.modal, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={styles.overlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Modal'}
    >
      <div className={modalClassNames} onClick={handleContentClick}>
        {(title || true) && (
          <div className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
