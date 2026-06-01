import { useTranslation } from '../../i18n/LanguageContext';
import type { ToolResponse } from '@jsoft/shared';
import formStyles from '../../styles/form.module.css';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
      {tools.map((tool) => {
        const badgeClass = statusClassMap[tool.status] || statusClassMap.DRAFT;
        return (
          <div
            key={tool.id}
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', margin: 0 }}>{tool.title}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={formStyles.btnEdit} onClick={() => onEdit(tool.id)}>{t('tools.edit')}</button>
              <button className={formStyles.btnDelete} onClick={() => onDelete(tool.id)}>{t('tools.delete')}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
