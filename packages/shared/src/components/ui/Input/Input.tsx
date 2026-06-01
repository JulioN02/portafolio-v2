/**
 * Input component with label, error message, and type support
 *
 * NOTE: Class names defined inline — CSS module maps are stripped by tsup.
 */
import type { InputHTMLAttributes } from 'react';

const styles = {
  wrapper: 'wrapper',
  label: 'label',
  input: 'input',
  inputError: 'inputError',
  error: 'error',
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Unique identifier for the input (used for label association) */
  id: string;
}

export function Input({
  label,
  error,
  id,
  className,
  type = 'text',
  ...rest
}: InputProps) {
  const inputClassNames = [
    styles.input,
    error ? styles.inputError : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={inputClassNames}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
