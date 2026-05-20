import type { ProjectSummary } from '../../types';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: ProjectSummary;
  onSelect: (project: ProjectSummary) => void;
}

/** Maps API type values to Spanish labels */
const typeLabels: Record<string, string> = {
  SERVICE: 'Servicio',
  PRODUCT: 'Producto',
  TOOL: 'Herramienta',
  SUCCESS_CASE: 'Caso de Éxito',
};

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const hasImage = project.images && project.images.length > 0;

  return (
    <article
      className={styles.card}
      onClick={() => onSelect(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(project);
        }
      }}
    >
      <div className={styles.imageWrapper}>
        {hasImage ? (
          <img
            src={project.images[0]}
            alt={project.title}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>{project.title.charAt(0)}</span>
          </div>
        )}
        <span className={styles.typeBadge}>
          {typeLabels[project.type] ?? project.type}
        </span>
      </div>

      <div className={styles.body}>
        <span className={styles.classification}>
          {project.classification}
        </span>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.description}>{project.description}</p>
      </div>
    </article>
  );
}
