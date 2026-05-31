import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loading, ErrorMessage } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useProducts } from '../../hooks/useProducts';
import { ProductTable } from '../../components/products/ProductTable';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';
import formStyles from '../../styles/form.module.css';

export function ProductsListPage() {
  const { t } = useTranslation();
  const [classificationFilter, setClassificationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { useGetAll, useDelete, useToggleFeatured, useUpdateStatus } = useProducts();
  const { data, isLoading, error } = useGetAll(
    classificationFilter ? { classification: classificationFilter, page: 1, limit: 10 } : undefined
  );
  const deleteMutation = useDelete();
  const toggleFeaturedMutation = useToggleFeatured();
  const updateStatusMutation = useUpdateStatus();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const handleDelete = (id: string) => {
    const product = data?.data?.find((p) => p.id === id);
    setDeleteTarget({ id, title: product?.title || '' });
  };

  const handleToggleFeatured = (id: string, featured: boolean) => {
    toggleFeaturedMutation.mutate({ id, featured });
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status: status as 'DRAFT' | 'PUBLISHED' | 'PRIVATE' | 'ARCHIVED' });
  };

  const allProducts = data?.data || [];
  const filteredProducts = statusFilter
    ? allProducts.filter((p) => p.status === statusFilter)
    : allProducts;

  const draftCount = allProducts.filter((p) => p.status === 'DRAFT').length;
  const publishedCount = allProducts.filter((p) => p.status === 'PUBLISHED').length;

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={t('common.error')} />;

  return (
    <div className={formStyles.adminContainer}>
      <div className={formStyles.pageHeader}>
        <h1 className={formStyles.pageTitle}>{t('products.title')}</h1>
        <Link to="/products/create">
          <button className={formStyles.btnAdd}>+ {t('products.add')}</button>
        </Link>
      </div>

      {/* Filter by classification */}
      <div className={formStyles.filterBar}>
        <input
          className={formStyles.filterSearch}
          placeholder={t('products.filterBy')}
          value={classificationFilter}
          onChange={(e) => setClassificationFilter(e.target.value)}
        />
        <button
          className={formStyles.btnStatus}
          style={!statusFilter ? { backgroundColor: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' } : {}}
          onClick={() => setStatusFilter(undefined)}
        >
          {t('common.all')} ({allProducts.length})
        </button>
        <button
          className={formStyles.btnStatus}
          style={statusFilter === 'PUBLISHED' ? { backgroundColor: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' } : {}}
          onClick={() => setStatusFilter('PUBLISHED')}
        >
          {t('blog.published')} ({publishedCount})
        </button>
        <button
          className={formStyles.btnStatus}
          style={statusFilter === 'DRAFT' ? { backgroundColor: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' } : {}}
          onClick={() => setStatusFilter('DRAFT')}
        >
          {t('blog.drafts')} ({draftCount})
        </button>
      </div>

      <div className={formStyles.tableWrapper}>
        <ProductTable
          products={filteredProducts}
          onDelete={handleDelete}
          onToggleFeatured={handleToggleFeatured}
          onStatusChange={handleStatusChange}
        />
      </div>

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.title || ''}
        entityName="producto"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
