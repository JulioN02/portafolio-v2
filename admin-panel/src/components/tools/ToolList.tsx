import { useState } from 'react';

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
  onReorder: (id: string, newOrder: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ToolList({ tools, onReorder, onEdit, onDelete }: ToolListProps) {
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

    const draggedTool = tools.find(t => t.id === dragId);
    const targetTool = tools.find(t => t.id === targetId);
    
    if (draggedTool && targetTool) {
      onReorder(dragId, targetTool.order);
    }
    
    setDragId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
  };

  if (tools.length === 0) {
    return <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No tools found</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
            border: dragId === tool.id ? '2px solid #4ade80' : 
                   dragOverId === tool.id ? '2px solid #f59e0b' : '1px solid #e5e7eb',
            opacity: dragId === tool.id ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: '1.5rem', cursor: 'grab' }}>⋮⋮</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '500', margin: 0 }}>{tool.title}</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{tool.classification}</p>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Order: {tool.order}</span>
          {tool.featured && <span style={{ fontSize: '0.75rem', background: '#fef3c7', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>Featured</span>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => onEdit(tool.id)}
              style={{ padding: '0.25rem 0.5rem', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete(tool.id)}
              style={{ padding: '0.25rem 0.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}