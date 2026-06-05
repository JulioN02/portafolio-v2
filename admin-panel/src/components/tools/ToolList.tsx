import { useTranslation } from '../../i18n/LanguageContext';
import type { ToolResponse } from '@jsoft/shared';
import formStyles from '../../styles/form.module.css';
import listStyles from '../shared/ListItem.module.css';

interface ToolListProps {
  tools: ToolResponse[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFeatured?: (id: string, featured: boolean) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const statusClassMap: Record<string, string> = {
  DRAFT: formStyles.badgeDraft,
  PUBLISHED: formStyles.badgePublished,
  PRIVATE: formStyles.badgePrivate,
  ARCHIVED: formStyles.badgeArchived,
};

export function ToolList({ tools, onEdit, onDelete, onToggleFeatured, onStatusChange }: ToolListProps) {
  const { t } = useTranslation();

  if (tools.length === 0) {
    return (
      <div className={formStyles.emptyState}>
        <p>{t('tools.empty')}</p>
      </div>
    );
  }

  return (
    <div className={listStyles.listItem}>
      {tools.map((tool) => {
        const badgeClass = statusClassMap[tool.status] || statusClassMap.DRAFT;
        return (
          <div key={tool.id} className={listStyles.listRow}>
            <div className={listStyles.content}>
              <p className={listStyles.title}>{tool.title}</p>
              <p className={listStyles.description}>
                {tool.classification}
              </p>
            </div>
            {onStatusChange ? (
              <select
                value={tool.status}
                onChange={(e) => onStatusChange(tool.id, e.target.value)}
                className={`${badgeClass} ${formStyles.statusSelectInline}`}
              >
                <option value="DRAFT">{t('blog.draft')}</option>
                <option value="PUBLISHED">{t('blog.published')}</option>
                <option value="PRIVATE">{t('blog.private')}</option>
                <option value="ARCHIVED">{t('blog.archived')}</option>
              </select>
            ) : (
              <span className={badgeClass}>{tool.status}</span>
            )}
            {onToggleFeatured && (
              <button
                className={formStyles.btnStatus}
                onClick={() => onToggleFeatured(tool.id, !tool.featured)}
              >
                {tool.featured ? t('common.yes') : t('common.no')}
              </button>
            )}
            <div className={listStyles.actions}>
              <button className={formStyles.btnEdit} onClick={() => onEdit(tool.id)}>{t('tools.edit')}</button>
              <button className={formStyles.btnDelete} onClick={() => onDelete(tool.id)}>{t('tools.delete')}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
