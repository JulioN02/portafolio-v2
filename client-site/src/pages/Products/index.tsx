import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useProducts, useClassifications } from '../../hooks/useProducts';
import { ProductCard } from '../../components/products/ProductCard';
import { Pagination } from '../../components/common/Pagination';
import { Loading } from '../../components/common/Loading';
import { MetaTags } from '../../components/seo/MetaTags';
import { Select } from '@jsoft/shared';
import { PageHeader } from '../../components/common/PageHeader';
import styles from './Products.module.css';

export function ProductsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [classification, setClassification] = useState<string>('');

  const { data, isLoading, error } = useProducts({
    filter: {
      page,
      limit: 9,
      ...(classification && { classification }),
    },
  });

  const { data: classifications } = useClassifications();

  const handleClassificationChange = (value: string) => {
    setClassification(value);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <MetaTags
        title={t('products.meta.title')}
        description={t('products.meta.description')}
      />
      <PageHeader
        title={t('products.pageHeader.title')}
        subtitle={t('products.pageHeader.subtitle')}
      />
      <div className={styles.container}>
        {/* Filters */}
        <div className={styles.filters}>
          <Select
            id="classification"
            value={classification}
            onChange={(e) => handleClassificationChange(e.target.value)}
            label={t('products.filter.label')}
            options={[
              { value: '', label: t('products.filter.allCategories') },
              ...(classifications?.map((cat) => ({ value: cat, label: cat })) ?? []),
            ]}
          />
        </div>

        {/* Content */}
        {isLoading && <Loading message={t('products.loading')} />}

        {error && (
          <div className={styles.error}>
            <p>{t('products.error')}</p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <>
            <div className={styles.grid}>
              {data.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        )}

        {data && data.data.length === 0 && (
          <div className={styles.empty}>
            <p>{t('products.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}