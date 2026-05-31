import { useTranslation } from '../../i18n/LanguageContext';
import formStyles from '../../styles/form.module.css';

interface StatusSelectProps {
  value: string;
  onChange: (newStatus: string) => void;
}

const statusOptions = ['DRAFT', 'PUBLISHED', 'PRIVATE', 'ARCHIVED'];

export function StatusSelect({ value, onChange }: StatusSelectProps) {
  const { t } = useTranslation();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={formStyles.filterSelect}
      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
    >
      {statusOptions.map((status) => (
        <option key={status} value={status}>
          {t(`blog.${status.toLowerCase()}`)}
        </option>
      ))}
    </select>
  );
}
