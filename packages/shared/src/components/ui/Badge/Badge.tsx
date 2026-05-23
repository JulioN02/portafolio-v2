/**
 * Badge component with color variants
 */
import type { ReactNode } from 'react';
import styles from './Badge.module.css';

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
