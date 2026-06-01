/**
 * Checkbox component with label support
 *
 * NOTE: Class names defined inline — CSS module maps are stripped by tsup.
 */
import type { InputHTMLAttributes } from 'react';

const styles = {
  wrapper: 'wrapper',
  checkbox: 'checkbox',
  label: 'label',
};

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text displayed next to the checkbox */
  label?: string;
  /** Unique identifier for the checkbox (used for label association) */
  id: string;
}

export function Checkbox({
  label,
  id,
  className,
  ...rest
}: CheckboxProps) {
  return (
    <div className={styles.wrapper}>
      <input
        type="checkbox"
        id={id}
        className={`${styles.checkbox} ${className ?? ''}`}
        {...rest}
      />
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
    </div>
  );
}
