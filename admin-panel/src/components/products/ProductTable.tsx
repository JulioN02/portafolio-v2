import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import type { ProductResponse } from '@jsoft/shared';
import formStyles from '../../styles/form.module.css';

interface ProductTableProps {
  products: ProductResponse[];
  onDelete: (id: string) => void;
  onToggleFeatured?: (id: string, featured: boolean) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const statusClassMap: Record<string, string> = {
  DRAFT: formStyles.badgeDraft,
  PUBLISHED: formStyles.badgePublished,
  PRIVATE: formStyles.badgePrivate,
  ARCHIVED: formStyles.badgeArchived,
};

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
      {products.map((product) => {
        const badgeClass = statusClassMap[product.status] || statusClassMap.DRAFT;
        return (
          <div
            key={product.id}
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', margin: 0 }}>{product.title}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>
                {product.classification} • {product.images.length} {t('products.images')?.toLowerCase()}
              </p>
            </div>
            {onStatusChange ? (
              <select
                value={product.status}
                onChange={(e) => onStatusChange(product.id, e.target.value)}
                className={`${badgeClass} ${formStyles.statusSelectInline}`}
              >
                <option value="DRAFT">{t('blog.draft')}</option>
                <option value="PUBLISHED">{t('blog.published')}</option>
                <option value="PRIVATE">{t('blog.private')}</option>
                <option value="ARCHIVED">{t('blog.archived')}</option>
              </select>
            ) : (
              <span className={badgeClass}>{product.status}</span>
            )}
            {onToggleFeatured && (
              <button
                className={formStyles.btnStatus}
                onClick={() => onToggleFeatured(product.id, !product.featured)}
              >
                {product.featured ? t('common.yes') : t('common.no')}
              </button>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to={`/products/edit/${product.id}`}>
                <button className={formStyles.btnEdit}>{t('products.edit')}</button>
              </Link>
              <button className={formStyles.btnDelete} onClick={() => onDelete(product.id)}>{t('products.delete')}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
