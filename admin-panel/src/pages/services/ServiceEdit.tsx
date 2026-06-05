import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { ServiceForm } from '../../components/services/ServiceForm';
import { useServices } from '../../hooks/useServices';
import { FormLayout } from '@/components/shared/FormLayout';
import { toast } from 'sonner';
import type { ServiceInput } from '@jsoft/shared';

export function ServiceEditPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useGetById, useUpdate } = useServices();
  const { data: service, isLoading } = useGetById(id!);
  const updateMutation = useUpdate();

  const handleSubmit = (data: ServiceInput) => {
    updateMutation.mutate(
      { id: id!, data },
      {
        onSuccess: () => {
          toast.success('Servicio actualizado exitosamente');
          navigate('/services');
        },
      }
    );
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>{t('common.loading')}</div>;
  if (!service) return <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>Service not found</div>;

  return (
    <FormLayout title={t('services.edit')} subtitle="Edit service details" backTo="/services">
      <ServiceForm initialData={service} onSubmit={handleSubmit} isLoading={updateMutation.isPending} />
    </FormLayout>
  );
}
