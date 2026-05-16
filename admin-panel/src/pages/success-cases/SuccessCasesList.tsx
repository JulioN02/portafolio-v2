import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSuccessCases } from '../../hooks/useSuccessCases';
import { SuccessCaseList } from '../../components/success-cases/SuccessCaseList';

export function SuccessCasesList() {
  const navigate = useNavigate();
  const { useGetAll, useDelete, useReorder } = useSuccessCases();
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { data, isLoading, error } = useGetAll({ page, limit });
  const deleteMutation = useDelete();
  const reorderMutation = useReorder();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this success case?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Error deleting success case:', err);
        alert('Failed to delete success case');
      }
    }
  };

  const handleReorder = async (id: string, newOrder: number) => {
    try {
      await reorderMutation.mutateAsync({ id, order: newOrder });
    } catch (err) {
      console.error('Error reordering success case:', err);
      alert('Failed to reorder success case');
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/success-cases/edit/${id}`);
  };

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: '#ef4444' }}>Error loading success cases</div>;
  }

  const successCases = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Success Cases</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>
            💡 Drag and drop to reorder
          </p>
        </div>
        <Link
          to="/success-cases/create"
          style={{
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}
        >
          Create New
        </Link>
      </div>

      {successCases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          No success cases found. Create your first one!
        </div>
      ) : (
        <>
          <SuccessCaseList
            successCases={successCases}
            onReorder={handleReorder}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '0.5rem 1rem',
                  background: page === 1 ? '#e5e7eb' : '#3b82f6',
                  color: page === 1 ? '#9ca3af' : '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <span style={{ padding: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  background: page === totalPages ? '#e5e7eb' : '#3b82f6',
                  color: page === totalPages ? '#9ca3af' : '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}