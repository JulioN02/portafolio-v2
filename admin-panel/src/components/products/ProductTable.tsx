import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import type { ProductResponse } from '@jsoft/shared';
import formStyles from '../../styles/form.module.css';
import listStyles from '../shared/ListItem.module.css';

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
    <div className={listStyles.listItem}>
      {products.map((product) => {
        const badgeClass = statusClassMap[product.status] || statusClassMap.DRAFT;
        return (
          <div key={product.id} className={listStyles.listRow}>
            <div className={listStyles.content}>
              <p className={listStyles.title}>{product.title}</p>
              <p className={listStyles.description}>
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
            <div className={listStyles.actions}>
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
