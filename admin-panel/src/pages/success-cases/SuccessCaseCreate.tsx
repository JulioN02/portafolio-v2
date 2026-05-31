import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSuccessCases } from '../../hooks/useSuccessCases';
import { SuccessCaseForm } from '../../components/success-cases/SuccessCaseForm';
import { FormLayout } from '@/components/shared/FormLayout';
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
    <FormLayout title={t('successCases.create')} subtitle="Create a new success case" backTo="/success-cases">
      <SuccessCaseForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </FormLayout>
  );
}
