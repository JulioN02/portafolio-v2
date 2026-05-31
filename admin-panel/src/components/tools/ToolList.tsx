import { useTranslation } from '../../i18n/LanguageContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatusSelect } from '@/components/shared/StatusSelect';
import type { ToolResponse } from '@jsoft/shared';
import formStyles from '../../styles/form.module.css';

interface ToolListProps {
  tools: ToolResponse[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFeatured?: (id: string, featured: boolean) => void;
  onStatusChange?: (id: string, status: string) => void;
}

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem' }}>
      {tools.map((tool) => (
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
          }}
        >
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '500', margin: 0 }}>{tool.title}</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{tool.classification}</p>
          </div>
          {onStatusChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <StatusBadge status={tool.status} />
              <StatusSelect value={tool.status} onChange={(newStatus) => onStatusChange(tool.id, newStatus)} />
            </div>
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
      ))}
    </div>
  );
}
