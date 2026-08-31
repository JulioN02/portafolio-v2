import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import type { ProjectResponse } from '@jsoft/shared';
import formStyles from '../../styles/form.module.css';
import listStyles from '../shared/ListItem.module.css';

interface ProjectTableProps {
  projects: ProjectResponse[];
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const statusClassMap: Record<string, string> = {
  DRAFT: formStyles.badgeDraft,
  PUBLISHED: formStyles.badgePublished,
  PRIVATE: formStyles.badgePrivate,
  ARCHIVED: formStyles.badgeArchived,
};

export function ProjectTable({ projects, onDelete, onStatusChange }: ProjectTableProps) {
  const { t } = useTranslation();

  if (projects.length === 0) {
    return (
      <div className={formStyles.emptyState}>
        <p>{t('projects.empty')}</p>
      </div>
    );
  }

  return (
    <div className={listStyles.listItem}>
      {projects.map((project) => {
        const badgeClass = statusClassMap[project.status] || statusClassMap.DRAFT;
        return (
          <div key={project.id} className={listStyles.listRow}>
            <div className={listStyles.content}>
              <p className={listStyles.title}>{project.title}</p>
              <p className={listStyles.description}>
                {project.tags && project.tags.length > 0 ? project.tags.join(', ') : project.slug}
              </p>
            </div>
            {onStatusChange ? (
              <select
                value={project.status}
                onChange={(e) => onStatusChange(project.id, e.target.value)}
                className={`${badgeClass} ${formStyles.statusSelectInline}`}
              >
                <option value="DRAFT">{t('blog.draft')}</option>
                <option value="PUBLISHED">{t('blog.published')}</option>
                <option value="PRIVATE">{t('blog.private')}</option>
                <option value="ARCHIVED">{t('blog.archived')}</option>
              </select>
            ) : (
              <span className={badgeClass}>{project.status}</span>
            )}
            <div className={listStyles.actions}>
              <Link to={`/projects/edit/${project.id}`}>
                <button className={formStyles.btnEdit}>{t('projects.edit')}</button>
              </Link>
              <button className={formStyles.btnDelete} onClick={() => onDelete(project.id)}>{t('projects.delete')}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}