import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@jsoft/shared';
import { useServices } from '../../hooks/useServices';
import { ServiceTable } from '../../components/services/ServiceTable';

export function ServicesListPage() {
  const [classificationFilter, setClassificationFilter] = useState('');
  const { useGetAll, useDelete, useToggleFeatured } = useServices();
  const { data, isLoading, error } = useGetAll(
    classificationFilter ? { classification: classificationFilter } : undefined
  );
  const deleteMutation = useDelete();
  const toggleFeaturedMutation = useToggleFeatured();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteMutation.mutate(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const handleToggleFeatured = (id: string, featured: boolean) => {
    toggleFeaturedMutation.mutate({ id, featured });
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>Error loading services</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Services</h1>
        <Link to="/services/create">
          <Button>Add Service</Button>
        </Link>
      </div>

      {/* Filter by classification */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Filter by classification..."
          value={classificationFilter}
          onChange={(e) => setClassificationFilter(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '0.875rem',
            width: '250px',
          }}
        />
      </div>

      <ServiceTable
        services={data?.data || []}
        onDelete={handleDelete}
        onToggleFeatured={handleToggleFeatured}
      />
    </div>
  );
}