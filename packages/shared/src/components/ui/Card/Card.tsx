/**
 * Card component with optional header, body, and footer slots
 */
import type { ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps {
  /** Header content */
  header?: ReactNode;
  /** Main body content */
  children: ReactNode;
  /** Footer content */
  footer?: ReactNode;
  /** Additional CSS class */
  className?: string;
}

export function Card({ header, children, footer, className }: CardProps) {
  const classNames = [styles.card, className ?? ''].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
