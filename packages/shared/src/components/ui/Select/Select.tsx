/**
 * Select component with label, error message, and option support
 *
 * NOTE: Class names defined inline — CSS module maps are stripped by tsup.
 * Corresponding styles are in Select.module.css → bundled into dist/index.css.
 */
import type { SelectHTMLAttributes } from 'react';

const styles = {
  wrapper: 'wrapper',
  label: 'label',
  select: 'select',
  selectError: 'selectError',
  error: 'error',
};

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Label text displayed above the select */
  label?: string;
  /** Error message displayed below the select */
  error?: string;
  /** Unique identifier for the select (used for label association) */
  id: string;
  /** Array of options to render */
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  id,
  options,
  className,
  ...rest
}: SelectProps) {
  const selectClassNames = [
    styles.select,
    error ? styles.selectError : '',
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
      <select id={id} className={selectClassNames} {...rest}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
