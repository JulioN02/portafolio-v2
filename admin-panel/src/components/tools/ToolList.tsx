import { useState } from 'react';
import { Button } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';

interface Tool {
  id: string;
  title: string;
  classification: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  requiresInstall: boolean;
  order: number;
  featured: boolean;
  technicalExplanation?: string;
  technicalImages?: string[];
}

interface ToolListProps {
  tools: Tool[];
  onReorder: (items: { id: string; order: number }[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFeatured?: (id: string, featured: boolean) => void;
}

export function ToolList({ tools, onReorder, onEdit, onDelete, onToggleFeatured }: ToolListProps) {
  const { t } = useTranslation();
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const sortedTools = [...tools].sort((a, b) => a.order - b.order);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;

    // Build the new order by recalculating ALL positions after the drop
    const draggedTool = tools.find(t => t.id === dragId);
    const targetTool = tools.find(t => t.id === targetId);
    
    if (!draggedTool || !targetTool) {
      setDragId(null);
      setDragOverId(null);
      return;
    }

    // Get all tool IDs in current sorted order
    const idsInOrder = sortedTools.map(t => t.id);
    
    // Remove dragged item from its current position
    const draggedIndex = idsInOrder.indexOf(dragId);
    idsInOrder.splice(draggedIndex, 1);
    
    // Insert dragged item at the target's position
    const targetIndex = idsInOrder.indexOf(targetId);
    const insertAt = targetIndex >= 0 ? targetIndex : idsInOrder.length;
    idsInOrder.splice(insertAt, 0, dragId);

    // Assign new sequential order values to ALL items
    const reorderItems = idsInOrder.map((id, idx) => ({
      id,
      order: idx,
    }));

    onReorder(reorderItems);
    
    setDragId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
  };

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
        {sortedTools.map((tool) => (
          <div
            key={tool.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tool.id)}
            onDragOver={(e) => handleDragOver(e, tool.id)}
            onDrop={(e) => handleDrop(e, tool.id)}
            onDragEnd={handleDragEnd}
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'grab',
              border: `${dragId === tool.id ? '2px solid #4ade80' : 
                     dragOverId === tool.id ? '2px solid #f59e0b' : '1px solid #e5e7eb'}`,
              borderLeft: dragId === tool.id ? '3px solid #4ade80' :
                         dragOverId === tool.id ? '3px solid #f59e0b' : '3px solid var(--color-green-accent)',
              opacity: dragId === tool.id ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ 
              fontSize: '1.5rem', 
              cursor: 'grab', 
              color: 'var(--color-neutral-400)',
              userSelect: 'none',
              lineHeight: '1',
            }}>
              ⋮⋮
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '500', margin: 0 }}>{tool.title}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{tool.classification}</p>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{t('tools.order')}: {tool.order}</span>
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
