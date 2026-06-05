import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { ProductForm } from '../../components/products/ProductForm';
import { useProducts } from '../../hooks/useProducts';
import { FormLayout } from '@/components/shared/FormLayout';
import { toast } from 'sonner';
import type { ProductInput } from '@jsoft/shared';

export function ProductCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { useCreate } = useProducts();
  const createMutation = useCreate();

  const handleSubmit = (data: ProductInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Producto creado exitosamente');
        navigate('/products');
      },
    });
  };

  return (
    <FormLayout title={t('products.create')} subtitle="Create a new product" backTo="/products">
      <ProductForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </FormLayout>
  );
}
