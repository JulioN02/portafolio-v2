import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

export function PageHeader({ title, subtitle, backgroundImage }: PageHeaderProps) {
  return (
    <div
      className={styles.header}
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(135deg, rgba(25,41,80,0.85) 0%, rgba(33,73,123,0.75) 100%), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
