import styles from './SectionTitle.module.css';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  align = 'center',
  className,
}: SectionTitleProps) {
  const wrapperClass = [
    styles.wrapper,
    align === 'center' ? styles.wrapperCenter : styles.wrapperLeft,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass}>
      <h2 className={styles.title}>{title}</h2>
      <div
        className={[
          styles.accent,
          align === 'center' ? styles.accentCenter : styles.accentLeft,
        ].join(' ')}
      />
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
