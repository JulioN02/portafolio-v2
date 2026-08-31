import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { ProjectForm } from '../../components/projects/ProjectForm';
import { useProjects } from '../../hooks/useProjects';
import { FormLayout } from '@/components/shared/FormLayout';
import { toast } from 'sonner';
import type { ProjectInput } from '@jsoft/shared';

export function ProjectCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { useCreate } = useProjects();
  const createMutation = useCreate();

  const handleSubmit = (data: ProjectInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Proyecto creado exitosamente');
        navigate('/projects');
      },
      onError: () => {
        toast.error('Error al crear el proyecto');
      },
    });
  };

  return (
    <FormLayout title={t('projects.create')} subtitle="Create a new project" backTo="/projects">
      <ProjectForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </FormLayout>
  );
}