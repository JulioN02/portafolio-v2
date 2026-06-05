import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { ProductForm } from '../../components/products/ProductForm';
import { useProducts } from '../../hooks/useProducts';
import { FormLayout } from '@/components/shared/FormLayout';
import { toast } from 'sonner';
import type { ProductInput } from '@jsoft/shared';

export function ProductEditPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useGetById, useUpdate } = useProducts();
  const { data: product, isLoading } = useGetById(id!);
  const updateMutation = useUpdate();

  const handleSubmit = (data: ProductInput) => {
    updateMutation.mutate(
      { id: id!, data },
      {
        onSuccess: () => {
          toast.success('Producto actualizado exitosamente');
          navigate('/products');
        },
      }
    );
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>{t('common.loading')}</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>Product not found</div>;

  return (
    <FormLayout title={t('products.edit')} subtitle="Edit product details" backTo="/products">
      <ProductForm initialData={product} onSubmit={handleSubmit} isLoading={updateMutation.isPending} />
    </FormLayout>
  );
}
