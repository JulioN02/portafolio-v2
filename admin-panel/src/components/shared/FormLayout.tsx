import formStyles from '../../styles/form.module.css';
import { BackButton } from './BackButton';

interface FormLayoutProps {
  title: string;
  subtitle?: string;
  backTo: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

/**
 * Reusable layout for all admin form pages
 * Provides: admin container → form card → header with title/back → main form body
 */
export function FormLayout({ title, subtitle, backTo, children, headerRight }: FormLayoutProps) {
  return (
    <div className={formStyles.adminContainer}>
      <div className={formStyles.formCard}>
        <div className={formStyles.formHeader}>
          <div>
            <BackButton to={backTo} />
            <h1 className={formStyles.formTitle}>{title}</h1>
            {subtitle && <p className={formStyles.formSubtitle}>{subtitle}</p>}
          </div>
          {headerRight && <div className={formStyles.headerRight}>{headerRight}</div>}
        </div>
        <div className={formStyles.mainForm}>
          {children}
        </div>
      </div>
    </div>
  );
}
