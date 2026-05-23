import { useState } from 'react';
import { useTools, useClassifications } from '../../hooks/useTools';
import { ToolCard } from '../../components/tools/ToolCard';
import { Pagination } from '../../components/common/Pagination';
import { Loading } from '../../components/common/Loading';
import { MetaTags } from '../../components/seo/MetaTags';
import { Select } from '@jsoft/shared';
import styles from './Tools.module.css';

export function ToolsPage() {
  const [page, setPage] = useState(1);
  const [classification, setClassification] = useState<string>('');

  const { data, isLoading, error } = useTools({
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
        title="Herramientas | J Soft Solutions"
        description="Herramientas y tecnologías que utilizamos para desarrollar soluciones innovadoras."
      />
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Nuestras Herramientas</h1>
          <p className={styles.subtitle}>
            Tecnologías y herramientas que utilizamos para crear soluciones innovadoras
          </p>
        </header>

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
        {isLoading && <Loading message="Cargando herramientas..." />}

        {error && (
          <div className={styles.error}>
            <p>Error al cargar las herramientas. Por favor, intenta de nuevo.</p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <>
            <div className={styles.grid}>
              {data.data.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
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
            <p>No se encontraron herramientas.</p>
          </div>
        )}
      </div>
    </div>
  );
}