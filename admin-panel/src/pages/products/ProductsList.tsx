import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@jsoft/shared';
import { useProducts } from '../../hooks/useProducts';
import { ProductTable } from '../../components/products/ProductTable';

export function ProductsListPage() {
  const [classificationFilter, setClassificationFilter] = useState('');
  const { useGetAll, useDelete } = useProducts();
  const { data, isLoading, error } = useGetAll(
    classificationFilter ? { classification: classificationFilter } : undefined
  );
  const deleteMutation = useDelete();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteMutation.mutate(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>Error loading products</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Products</h1>
        <Link to="/products/create">
          <Button>Add Product</Button>
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

      <ProductTable
        products={data?.data || []}
        onDelete={handleDelete}
      />
    </div>
  );
}