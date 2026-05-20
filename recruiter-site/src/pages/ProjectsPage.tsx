import { useState, useCallback } from 'react';
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
