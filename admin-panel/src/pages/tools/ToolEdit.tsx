import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { ToolForm } from '../../components/tools/ToolForm';
import { useTools } from '../../hooks/useTools';
import { FormLayout } from '@/components/shared/FormLayout';
import type { ToolInput } from '@jsoft/shared';

export function ToolEditPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useGetById, useUpdate } = useTools();
  const { data: tool, isLoading } = useGetById(id!);
  const updateMutation = useUpdate();

  const handleSubmit = (data: ToolInput) => {
    updateMutation.mutate(
      { id: id!, data },
      {
        onSuccess: () => {
          navigate('/tools');
        },
      }
    );
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>{t('common.loading')}</div>;
  if (!tool) return <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>Tool not found</div>;

  return (
    <FormLayout title={t('tools.edit')} subtitle="Edit tool details" backTo="/tools">
      <ToolForm initialData={tool} onSubmit={handleSubmit} isLoading={updateMutation.isPending} />
    </FormLayout>
  );
}
