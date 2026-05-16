import { useNavigate } from 'react-router-dom';
import { ProductForm } from '../../components/products/ProductForm';
import { useProducts } from '../../hooks/useProducts';
import type { ProductInput } from '@jsoft/shared';

export function ProductCreatePage() {
  const navigate = useNavigate();
  const { useCreate } = useProducts();
  const createMutation = useCreate();

  const handleSubmit = (data: ProductInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        navigate('/products');
      },
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create Product</h1>
      <ProductForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </div>
  );
}