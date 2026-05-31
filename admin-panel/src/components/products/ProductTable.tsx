import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatusSelect } from '@/components/shared/StatusSelect';
import type { ProductResponse } from '@jsoft/shared';
import formStyles from '../../styles/form.module.css';

interface ProductTableProps {
  products: ProductResponse[];
  onDelete: (id: string) => void;
  onToggleFeatured?: (id: string, featured: boolean) => void;
  onStatusChange?: (id: string, status: string) => void;
}

export function ProductTable({ products, onDelete, onToggleFeatured, onStatusChange }: ProductTableProps) {
  const { t } = useTranslation();

  if (products.length === 0) {
    return (
      <div className={formStyles.emptyState}>
        <p>{t('products.empty')}</p>
      </div>
    );
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Classification</th>
          <th>{t('products.images')}</th>
          <th style={{ textAlign: 'center' }}>{t('blog.status')}</th>
          <th style={{ textAlign: 'center' }}>{t('tools.featured')}</th>
          <th style={{ textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{product.title}</td>
            <td>{product.classification}</td>
            <td>{product.images.length}</td>
            <td style={{ textAlign: 'center' }}>
              {onStatusChange && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <StatusBadge status={product.status} />
                  <StatusSelect value={product.status} onChange={(newStatus) => onStatusChange(product.id, newStatus)} />
                </div>
              )}
            </td>
            <td style={{ textAlign: 'center' }}>
              {onToggleFeatured && (
                <button
                  className={formStyles.btnStatus}
                  onClick={() => onToggleFeatured(product.id, !product.featured)}
                >
                  {product.featured ? t('common.yes') : t('common.no')}
                </button>
              )}
            </td>
            <td style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <Link to={`/products/edit/${product.id}`}>
                  <button className={formStyles.btnEdit}>{t('products.edit')}</button>
                </Link>
                <button className={formStyles.btnDelete} onClick={() => onDelete(product.id)}>{t('products.delete')}</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
