import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSuccessCases } from '../../hooks/useSuccessCases';
import { SuccessCaseForm } from '../../components/success-cases/SuccessCaseForm';
import { BackButton } from '@/components/shared/BackButton';
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
      <BackButton to="/success-cases" />
      
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