import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import listStyles from './ListItem.module.css';

interface BackButtonProps {
  to: string;
  label?: string;
}

export function BackButton({ to, label }: BackButtonProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const text = label || t('common.back');

  return (
    <button
      onClick={() => navigate(to)}
      className={listStyles.backButton}
    >
      {text}
    </button>
  );
}
