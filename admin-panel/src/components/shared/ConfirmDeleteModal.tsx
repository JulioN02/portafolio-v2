import { useTranslation } from '../../i18n/LanguageContext';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  entityName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  title,
  entityName,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <h3 style={{ margin: '0 0 8px', fontSize: '1.125rem' }}>
          {t('common.confirmDelete')}
        </h3>
        <p style={{ color: '#6b7280', margin: '0 0 4px' }}>
          {t('common.deleteConfirm')} {entityName}
        </p>
        <p style={{ fontWeight: 600, margin: '0 0 16px', fontSize: '0.9rem' }}>
          {title}
        </p>
        <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0 0 16px' }}>
          {t('common.irreversible')}
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: '#ef4444',
              color: '#fff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Eliminando...' : t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
