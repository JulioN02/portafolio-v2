import { useState } from 'react';
import { useProducts, useClassifications } from '../../hooks/useProducts';
import { ProductCard } from '../../components/products/ProductCard';
import { Pagination } from '../../components/common/Pagination';
import { Loading } from '../../components/common/Loading';
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
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Nuestros Productos</h1>
          <p className={styles.subtitle}>
            Soluciones tecnológicas diseñadas para potenciar tu negocio
          </p>
        </header>

        {/* Filters */}
        <div className={styles.filters}>
          <label htmlFor="classification" className={styles.filterLabel}>
            Filtrar por:
          </label>
          <select
            id="classification"
            value={classification}
            onChange={(e) => handleClassificationChange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todas las categorías</option>
            {classifications?.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
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