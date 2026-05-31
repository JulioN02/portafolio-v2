import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { ProductForm } from '../../components/products/ProductForm';
import { useProducts } from '../../hooks/useProducts';
import { BackButton } from '@/components/shared/BackButton';
import type { ProductInput } from '@jsoft/shared';

export function ProductCreatePage() {
  const { t } = useTranslation();
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
      <BackButton to="/products" />
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{t('products.create')}</h1>
      <ProductForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </div>
  );
}