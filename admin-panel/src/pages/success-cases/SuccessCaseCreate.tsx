import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSuccessCases } from '../../hooks/useSuccessCases';
import { SuccessCaseForm } from '../../components/success-cases/SuccessCaseForm';
import type { SuccessCaseInput } from '@jsoft/shared';

export function SuccessCaseCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { useCreate } = useSuccessCases();
  
  const createMutation = useCreate();

  const handleSubmit = async (data: SuccessCaseInput) => {
    try {
      await createMutation.mutateAsync(data);
      navigate('/success-cases');
    } catch (err) {
      console.error('Error creating success case:', err);
      alert('Failed to create success case');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/success-cases')}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: '#6b7280',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        ← {t('contactMessages.back')} {t('successCases.title')}
      </button>
      
      <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
        {t('successCases.create')}
      </h1>
      
      <SuccessCaseForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}