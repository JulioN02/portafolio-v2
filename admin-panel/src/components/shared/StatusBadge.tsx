import { useTranslation } from '../../i18n/LanguageContext';
import formStyles from '../../styles/form.module.css';

interface StatusBadgeProps {
  status: string;
}

const statusClassMap: Record<string, string> = {
  DRAFT: formStyles.badgeDraft,
  PUBLISHED: formStyles.badgePublished,
  PRIVATE: formStyles.badgePrivate,
  ARCHIVED: formStyles.badgeArchived,
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const badgeClass = statusClassMap[status] || statusClassMap.DRAFT;
  const label = t(`blog.${status.toLowerCase()}`);

  return (
    <span className={badgeClass}>
      {label}
    </span>
  );
}
