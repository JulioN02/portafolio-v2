/**
 * Button component with variants, sizes, and loading state
 *
 * NOTE: Class names defined inline — CSS module maps are stripped by tsup.
 * Corresponding styles are in Button.module.css → bundled into dist/index.css.
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const styles = {
  button: 'button',
  primary: 'primary',
  secondary: 'secondary',
  danger: 'danger',
  whatsapp: 'whatsapp',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  large: 'large',
  full: 'full',
  loading: 'loading',
  spinner: 'spinner',
  hiddenContent: 'hiddenContent',
};

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'whatsapp';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Show loading spinner and disable interaction */
  loading?: boolean;
  /** Button content */
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    loading ? styles.loading : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classNames}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={loading ? styles.hiddenContent : ''}>{children}</span>
    </button>
  );
}
