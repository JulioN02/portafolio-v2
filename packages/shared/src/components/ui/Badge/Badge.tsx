/**
 * Badge component with color variants
 *
 * NOTE: Class names defined inline — CSS module maps are stripped by tsup.
 */
import type { ReactNode } from 'react';

const styles = {
  badge: 'badge',
  default: 'default',
  developing: 'developing',
  available: 'available',
  coming: 'coming',
};

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'developing' | 'available' | 'coming';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const classNames = [styles.badge, styles[variant], className ?? '']
    .filter(Boolean)
    .join(' ');

  return <span className={classNames}>{children}</span>;
}
