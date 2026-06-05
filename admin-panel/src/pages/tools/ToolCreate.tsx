import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { ToolForm } from '../../components/tools/ToolForm';
import { useTools } from '../../hooks/useTools';
import { FormLayout } from '@/components/shared/FormLayout';
import { toast } from 'sonner';
import type { ToolInput } from '@jsoft/shared';

export function ToolCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { useCreate } = useTools();
  const createMutation = useCreate();

  const handleSubmit = (data: ToolInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Herramienta creada exitosamente');
        navigate('/tools');
      },
    });
  };

  return (
    <FormLayout title={t('tools.create')} subtitle="Create a new tool" backTo="/tools">
      <ToolForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </FormLayout>
  );
}
