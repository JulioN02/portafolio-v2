import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { ProjectForm } from '../../components/projects/ProjectForm';
import { useProjects } from '../../hooks/useProjects';
import { FormLayout } from '@/components/shared/FormLayout';
import { toast } from 'sonner';
import type { ProjectInput } from '@jsoft/shared';

export function ProjectEditPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useGetById, useUpdate } = useProjects();
  const { data: project, isLoading } = useGetById(id!);
  const updateMutation = useUpdate();

  const handleSubmit = (data: ProjectInput) => {
    updateMutation.mutate(
      { id: id!, data },
      {
        onSuccess: () => {
          toast.success('Proyecto actualizado exitosamente');
          navigate('/projects');
        },
        onError: () => {
          toast.error('Error al actualizar el proyecto');
        },
      }
    );
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>{t('common.loading')}</div>;
  if (!project) return <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>Project not found</div>;

  return (
    <FormLayout title={t('projects.edit')} subtitle="Edit project details" backTo="/projects">
      <ProjectForm initialData={project} onSubmit={handleSubmit} isLoading={updateMutation.isPending} />
    </FormLayout>
  );
}