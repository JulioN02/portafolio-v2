/**
 * Card component with optional header, body, footer, badge, and image slots
 *
 * NOTE: Class names defined inline — CSS module maps are stripped by tsup.
 */
import type { ReactNode } from 'react';

const styles = {
  card: 'card',
  image: 'image',
  badge: 'badge',
  header: 'header',
  body: 'body',
  footer: 'footer',
};

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
