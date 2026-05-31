import { useTranslation } from '../../i18n/LanguageContext';

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
      style={{
        padding: '4px 8px',
        borderRadius: '4px',
        border: '1px solid #d1d5db',
        fontSize: '0.75rem',
        cursor: 'pointer',
      }}
    >
      {statusOptions.map((status) => (
        <option key={status} value={status}>
          {t(`blog.${status.toLowerCase()}`)}
        </option>
      ))}
    </select>
  );
}
