import { useState } from 'react';
import type { SuccessCaseResponse } from '@jsoft/shared';
import { Button } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';

interface SuccessCaseListProps {
  successCases: SuccessCaseResponse[];
  onReorder: (id: string, newOrder: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFeatured?: (id: string, featured: boolean) => void;
}

// Extended interface with additional fields that may come from the API
interface ExtendedSuccessCase extends SuccessCaseResponse {
  clientName?: string;
  classification?: string;
  link?: string;
}

export function SuccessCaseList({ successCases, onReorder, onEdit, onDelete, onToggleFeatured }: SuccessCaseListProps) {
  const { t } = useTranslation();
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Cast to extended type to access additional fields
  const cases = successCases as ExtendedSuccessCase[];
  
  // Sort by order if available, otherwise by createdAt
  const sortedCases = [...cases].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

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

    const draggedCase = cases.find(c => c.id === dragId);
    const targetCase = cases.find(c => c.id === targetId);
    
    if (draggedCase && targetCase) {
      // Use order if available, otherwise use a default value
      const newOrder = targetCase.order ?? 0;
      onReorder(dragId, newOrder);
    }
    
    setDragId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
  };

  if (successCases.length === 0) {
    return (
      <div className="admin-empty">
        <div className="admin-empty-icon">📋</div>
        <div className="admin-empty-text">{t('successCases.empty')}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {sortedCases.map((successCase) => (
        <div
          key={successCase.id}
          draggable
          onDragStart={(e) => handleDragStart(e, successCase.id)}
          onDragOver={(e) => handleDragOver(e, successCase.id)}
          onDrop={(e) => handleDrop(e, successCase.id)}
          onDragEnd={handleDragEnd}
          style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'grab',
            border: dragId === successCase.id ? '2px solid #4ade80' : 
                   dragOverId === successCase.id ? '2px solid #f59e0b' : '1px solid #e5e7eb',
            opacity: dragId === successCase.id ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: '1.5rem', cursor: 'grab' }}>⋮⋮</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '500', margin: 0 }}>{successCase.title}</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              {successCase.clientName || 'No client name'}
              {successCase.classification && ` • ${successCase.classification}`}
            </p>
          </div>
          {successCase.order !== undefined && (
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Order: {successCase.order}</span>
          )}
          {onToggleFeatured && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onToggleFeatured(successCase.id, !(successCase as ExtendedSuccessCase).featured)}
            >
              {(successCase as ExtendedSuccessCase).featured ? t('common.yes') : t('common.no')}
            </Button>
          )}
          {successCase.link && (
            <a 
              href={successCase.link} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'none' }}
            >
              Link ↗
            </a>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={() => onEdit(successCase.id)}>{t('successCases.edit')}</Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(successCase.id)}>{t('successCases.delete')}</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
