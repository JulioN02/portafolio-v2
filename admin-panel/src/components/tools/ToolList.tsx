import { Button } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatusSelect } from '@/components/shared/StatusSelect';
import type { ToolResponse } from '@jsoft/shared';

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
      <div className="admin-empty">
        <div className="admin-empty-icon">🔧</div>
        <div className="admin-empty-text">{t('tools.empty')}</div>
      </div>
    );
  }

  return (
    <div className="admin-card">
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onToggleFeatured(tool.id, !tool.featured)}
              >
                {tool.featured ? t('common.yes') : t('common.no')}
              </Button>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="secondary" size="sm" onClick={() => onEdit(tool.id)}>{t('tools.edit')}</Button>
              <Button variant="danger" size="sm" onClick={() => onDelete(tool.id)}>{t('tools.delete')}</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
