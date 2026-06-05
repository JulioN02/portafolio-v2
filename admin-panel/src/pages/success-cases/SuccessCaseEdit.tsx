import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSuccessCases } from '../../hooks/useSuccessCases';
import { SuccessCaseForm } from '../../components/success-cases/SuccessCaseForm';
import { FormLayout } from '@/components/shared/FormLayout';
import { toast } from 'sonner';
import type { SuccessCaseInput, SuccessCaseUpdateInput } from '@jsoft/shared';

export function SuccessCaseEdit() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useGetById, useUpdate } = useSuccessCases();

  const { data: successCase, isLoading, error } = useGetById(id!);
  const updateMutation = useUpdate();

  const handleSubmit = async (data: SuccessCaseInput) => {
    try {
      await updateMutation.mutateAsync({
        id: id!,
        data: data as Partial<SuccessCaseUpdateInput>
      });
      toast.success('Caso de éxito actualizado exitosamente');
      navigate('/success-cases');
    } catch (err) {
      console.error('Error updating success case:', err);
      toast.error('Error al actualizar el caso de éxito');
    }
  };

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('common.loading')}</div>;
  }

  if (error || !successCase) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ color: '#ef4444', marginBottom: '1rem' }}>
          {t('common.error')}
        </div>
        <button
          onClick={() => navigate('/success-cases')}
          style={{
            padding: '0.5rem 1rem',
            background: '#6b7280',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {t('contactMessages.back')} {t('successCases.title')}
        </button>
      </div>
    );
  }

  return (
    <FormLayout title={`${t('successCases.edit')} ${t('successCases.title')}`} subtitle="Edit success case details" backTo="/success-cases">
      <SuccessCaseForm
        initialData={successCase}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />
    </FormLayout>
  );
}
