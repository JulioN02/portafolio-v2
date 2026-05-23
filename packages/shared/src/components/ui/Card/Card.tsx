/**
 * Card component with optional header, body, footer, badge, and image slots
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
  /** Badge text (green accent, uppercase) */
  badge?: string;
  /** Image URL (200px height at top) */
  image?: string;
  /** Additional CSS class */
  className?: string;
}

export function Card({ header, children, footer, badge, image, className }: CardProps) {
  const classNames = [styles.card, className ?? ''].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      {image && <img src={image} alt="" className={styles.image} loading="lazy" />}
      {badge && <div className={styles.badge}>{badge}</div>}
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
