import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@jsoft/shared';
import { useTools } from '../../hooks/useTools';
import { ToolList } from '../../components/tools/ToolList';

export function ToolsListPage() {
  const { useGetAll, useDelete, useReorder } = useTools();
  const { data, isLoading, error } = useGetAll();
  const deleteMutation = useDelete();
  const reorderMutation = useReorder();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteMutation.mutate(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const handleReorder = (id: string, newOrder: number) => {
    reorderMutation.mutate({ id, order: newOrder });
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>Error loading tools</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Tools</h1>
        <Link to="/tools/create">
          <Button>Add Tool</Button>
        </Link>
      </div>
      
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px' }}>
        <p style={{ fontSize: '0.875rem', color: '#0369a1', margin: 0 }}>
          💡 Drag and drop to reorder tools
        </p>
      </div>

      <ToolList
        tools={(data?.data || []).map(t => ({ ...t, order: t.order || 0 }))}
        onReorder={handleReorder}
        onEdit={(id) => window.location.href = `/tools/edit/${id}`}
        onDelete={handleDelete}
      />
    </div>
  );
}