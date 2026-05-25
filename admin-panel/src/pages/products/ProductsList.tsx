import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Loading, ErrorMessage } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useProducts } from '../../hooks/useProducts';
import { ProductTable } from '../../components/products/ProductTable';

export function ProductsListPage() {
  const { t } = useTranslation();
  const [classificationFilter, setClassificationFilter] = useState('');
  const { useGetAll, useDelete } = useProducts();
  const { data, isLoading, error } = useGetAll(
    classificationFilter ? { classification: classificationFilter, page: 1, limit: 10 } : undefined
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

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={t('common.error')} />;

  return (
    <div>
      <div className="admin-page-header">
        <h1>{t('products.title')}</h1>
        <Link to="/products/create">
          <Button>{t('products.add')}</Button>
        </Link>
      </div>

      {/* Filter by classification */}
      <div className="admin-filter-bar">
        <Input
          id="product-filter"
          placeholder={t('products.filterBy')}
          value={classificationFilter}
          onChange={(e) => setClassificationFilter(e.target.value)}
        />
      </div>

      <div className="admin-card">
        <ProductTable
          products={data?.data || []}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
