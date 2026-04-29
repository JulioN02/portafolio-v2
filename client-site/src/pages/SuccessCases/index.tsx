import { useState } from 'react';
import { useSuccessCases } from '../../hooks/useSuccessCases';
import { SuccessCaseCard } from '../../components/successCases/SuccessCaseCard';
import { Pagination } from '../../components/common/Pagination';
import { Loading } from '../../components/common/Loading';
import styles from './SuccessCases.module.css';

export function SuccessCasesPage() {
  const [page, setPage] = useState(1);
  const [industry, setIndustry] = useState<string>('');

  const { data, isLoading, error } = useSuccessCases({
    filter: {
      page,
      limit: 9,
      ...(industry && { industry }),
    },
  });

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Casos de Éxito</h1>
          <p className={styles.subtitle}>
            Conoce cómo hemos ayudado a nuestros clientes a alcanzar sus objetivos
          </p>
        </header>

        {/* Filters */}
        <div className={styles.filters}>
          <label htmlFor="industry" className={styles.filterLabel}>
            Filtrar por industria:
          </label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => handleIndustryChange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todas las industrias</option>
            <option value="Tecnología">Tecnología</option>
            <option value="Finanzas">Finanzas</option>
            <option value="Salud">Salud</option>
            <option value="Educación">Educación</option>
            <option value="Comercio">Comercio</option>
          </select>
        </div>

        {/* Content */}
        {isLoading && <Loading message="Cargando casos de éxito..." />}

        {error && (
          <div className={styles.error}>
            <p>Error al cargar los casos de éxito. Por favor, intenta de nuevo.</p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <>
            <div className={styles.grid}>
              {data.data.map((successCase) => (
                <SuccessCaseCard key={successCase.id} successCase={successCase} />
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
            <p>No se encontraron casos de éxito.</p>
          </div>
        )}
      </div>
    </div>
  );
}