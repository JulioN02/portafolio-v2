/**
 * Textarea component with label, error message, and support
 *
 * NOTE: Class names defined inline — CSS module maps are stripped by tsup.
 */
import type { TextareaHTMLAttributes } from 'react';

const styles = {
  wrapper: 'wrapper',
  label: 'label',
  textarea: 'textarea',
  textareaError: 'textareaError',
  error: 'error',
};

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text displayed above the textarea */
  label?: string;
  /** Error message displayed below the textarea */
  error?: string;
  /** Unique identifier for the textarea (used for label association) */
  id: string;
}

export function Textarea({
  label,
  error,
  id,
  className,
  ...rest
}: TextareaProps) {
  const textareaClassNames = [
    styles.textarea,
    error ? styles.textareaError : '',
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
      <textarea
        id={id}
        className={textareaClassNames}
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
