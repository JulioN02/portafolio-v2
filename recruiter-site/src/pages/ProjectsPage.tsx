import { useState, useCallback } from 'react';
import { MetaTags } from '../components/seo/MetaTags';
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectDetailModal } from '../components/projects/ProjectDetailModal';
import { useTranslation } from '../i18n/LanguageContext';
import type { ProjectSummary } from '../types';

export function ProjectsPage() {
  const { t } = useTranslation();
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(
    null,
  );

  const handleSelectProject = useCallback((project: ProjectSummary) => {
    setSelectedProject(project);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedProject(null);
  }, []);

  return (
    <>
      <MetaTags
        title={t('projects.meta.title')}
        description={t('projects.meta.description')}
      />
      <ProjectList onSelectProject={handleSelectProject} />
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
