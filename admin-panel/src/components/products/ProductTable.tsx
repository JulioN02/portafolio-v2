import { Link } from 'react-router-dom';
import { Button } from '@jsoft/shared';
import type { ProductResponse } from '@jsoft/shared';

interface ProductTableProps {
  products: ProductResponse[];
  onDelete: (id: string) => void;
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No products found</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
          <th style={{ textAlign: 'left', padding: '0.75rem' }}>Title</th>
          <th style={{ textAlign: 'left', padding: '0.75rem' }}>Classification</th>
          <th style={{ textAlign: 'left', padding: '0.75rem' }}>Images</th>
          <th style={{ textAlign: 'right', padding: '0.75rem' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
            <td style={{ padding: '0.75rem' }}>{product.title}</td>
            <td style={{ padding: '0.75rem' }}>{product.classification}</td>
            <td style={{ padding: '0.75rem' }}>{product.images.length}</td>
            <td style={{ textAlign: 'right', padding: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Link to={`/products/edit/${product.id}`}>
                <Button variant="secondary" size="sm">Edit</Button>
              </Link>
              <Button variant="danger" size="sm" onClick={() => onDelete(product.id)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}