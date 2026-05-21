import { useState, useCallback } from 'react';
import { MetaTags } from '../components/seo/MetaTags';
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectDetailModal } from '../components/projects/ProjectDetailModal';
import type { ProjectSummary } from '../types';

export function ProjectsPage() {
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
        title="Proyectos | Julián Naranjo"
        description="Explora los proyectos en los que he trabajado como desarrollador Full Stack."
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
