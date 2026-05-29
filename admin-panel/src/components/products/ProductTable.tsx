import { Link } from 'react-router-dom';
import { Button } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import type { ProductResponse } from '@jsoft/shared';

interface ProductTableProps {
  products: ProductResponse[];
  onDelete: (id: string) => void;
  onToggleFeatured?: (id: string, featured: boolean) => void;
}

export function ProductTable({ products, onDelete, onToggleFeatured }: ProductTableProps) {
  const { t } = useTranslation();

  if (products.length === 0) {
    return (
      <div className="admin-empty">
        <div className="admin-empty-icon">📋</div>
        <div className="admin-empty-text">{t('products.empty')}</div>
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
          <th style={{ textAlign: 'center' }}>{t('services.featured')}</th>
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
              {onToggleFeatured && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onToggleFeatured(product.id, !product.featured)}
                >
                  {product.featured ? t('common.yes') : t('common.no')}
                </Button>
              )}
            </td>
            <td style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <Link to={`/products/edit/${product.id}`}>
                  <Button variant="secondary" size="sm">{t('products.edit')}</Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => onDelete(product.id)}>{t('products.delete')}</Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
