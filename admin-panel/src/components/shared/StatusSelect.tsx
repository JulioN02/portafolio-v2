import { useTranslation } from '../../i18n/LanguageContext';
import formStyles from '../../styles/form.module.css';
import listStyles from './ListItem.module.css';

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
      className={`${formStyles.filterSelect} ${listStyles.statusSelect}`}
    >
      {statusOptions.map((status) => (
        <option key={status} value={status}>
          {t(`blog.${status.toLowerCase()}`)}
        </option>
      ))}
    </select>
  );
}
