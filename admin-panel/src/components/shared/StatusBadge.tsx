import { useTranslation } from '../../i18n/LanguageContext';

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  DRAFT: { bg: '#fef3c7', color: '#92400e' },      // amber
  PUBLISHED: { bg: '#d1fae5', color: '#065f46' },   // green
  PRIVATE: { bg: '#dbeafe', color: '#1e40af' },      // blue
  ARCHIVED: { bg: '#f3f4f6', color: '#6b7280' },     // gray
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const colors = statusColors[status] || statusColors.DRAFT;
  const label = t(`blog.${status.toLowerCase()}`);

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: colors.bg,
        color: colors.color,
      }}
    >
      {label}
    </span>
  );
}
