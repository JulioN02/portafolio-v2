import { useState } from 'react';
import { useProducts, useClassifications } from '../../hooks/useProducts';
import { ProductCard } from '../../components/products/ProductCard';
import { Pagination } from '../../components/common/Pagination';
import { Loading } from '../../components/common/Loading';
import { MetaTags } from '../../components/seo/MetaTags';
import { Select } from '@jsoft/shared';
import { PageHeader } from '../../components/common/PageHeader';
import styles from './Products.module.css';

export function ProductsPage() {
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
        title="Productos | J Soft Solutions"
        description="Conoce nuestras soluciones tecnológicas listas para implementar en tu negocio."
      />
      <PageHeader
        title="Nuestros Productos"
        subtitle="Soluciones tecnológicas diseñadas para potenciar tu negocio"
      />
      <div className={styles.container}>
        {/* Filters */}
        <div className={styles.filters}>
          <Select
            id="classification"
            value={classification}
            onChange={(e) => handleClassificationChange(e.target.value)}
            label="Filtrar por:"
            options={[
              { value: '', label: 'Todas las categorías' },
              ...(classifications?.map((cat) => ({ value: cat, label: cat })) ?? []),
            ]}
          />
        </div>

        {/* Content */}
        {isLoading && <Loading message="Cargando productos..." />}

        {error && (
          <div className={styles.error}>
            <p>Error al cargar los productos. Por favor, intenta de nuevo.</p>
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
            <p>No se encontraron productos.</p>
          </div>
        )}
      </div>
    </div>
  );
}