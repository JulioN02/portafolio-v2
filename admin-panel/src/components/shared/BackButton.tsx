import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';

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
      style={{
        background: '#6b7280',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '6px 12px',
        fontSize: '0.875rem',
        cursor: 'pointer',
        marginBottom: '16px',
      }}
    >
      {text}
    </button>
  );
}
