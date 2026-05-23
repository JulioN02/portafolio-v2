import { useState } from 'react';
import { useServices } from '../../hooks/useServices';
import { ServiceCard } from '../../components/services/ServiceCard';
import { Loading } from '../../components/common/Loading';
import { PageHeader } from '../../components/common/PageHeader';
import { MetaTags } from '../../components/seo/MetaTags';
import { Select } from '@jsoft/shared';
import styles from './Services.module.css';

export function ServicesPage() {
  const [page, setPage] = useState(1);
  const [classification, setClassification] = useState<string>('');

  const { data, isLoading, error } = useServices({
    filter: {
      page,
      limit: 9,
      ...(classification && { classification }),
    },
  });

  const handleClassificationChange = (value: string) => {
    setClassification(value);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <MetaTags
        title="Servicios | J Soft Solutions"
        description="Ofrecemos desarrollo web, diseño UI/UX y consultoría tecnológica personalizada."
      />
      <PageHeader
        title="Nuestros Servicios"
        subtitle="Soluciones tecnológicas adaptadas a tus necesidades"
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
              { value: 'Desarrollo', label: 'Desarrollo' },
              { value: 'Diseño', label: 'Diseño' },
              { value: 'Consultoría', label: 'Consultoría' },
            ]}
          />
        </div>

        {/* Content */}
        {isLoading && <Loading message="Cargando servicios..." />}

        {error && (
          <div className={styles.error}>
            <p>Error al cargar los servicios. Por favor, intenta de nuevo.</p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <>
            <div className={styles.grid}>
              {data.data.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <nav className={styles.pagination} aria-label="Paginación">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!data.pagination.hasPrev}
                  className={styles.pageButton}
                >
                  ← Anterior
                </button>

                <span className={styles.pageInfo}>
                  Página {data.pagination.page} de {data.pagination.totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.pagination.hasNext}
                  className={styles.pageButton}
                >
                  Siguiente →
                </button>
              </nav>
            )}
          </>
        )}

        {data && data.data.length === 0 && (
          <div className={styles.empty}>
            <p>No se encontraron servicios.</p>
          </div>
        )}
      </div>
    </div>
  );
}
