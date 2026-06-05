import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { ServiceForm } from '../../components/services/ServiceForm';
import { useServices } from '../../hooks/useServices';
import { FormLayout } from '@/components/shared/FormLayout';
import { toast } from 'sonner';
import type { ServiceInput } from '@jsoft/shared';

export function ServiceCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { useCreate } = useServices();
  const createMutation = useCreate();

  const handleSubmit = (data: ServiceInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Servicio creado exitosamente');
        navigate('/services');
      },
    });
  };

  return (
    <FormLayout title={t('services.create')} subtitle="Create a new service" backTo="/services">
      <ServiceForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </FormLayout>
  );
}
