import { useState, useMemo } from 'react';
import { useProjects, useProjectClassifications } from '../../hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import type { ProjectSummary } from '../../types';
import styles from './ProjectList.module.css';

interface ProjectListProps {
  onSelectProject: (project: ProjectSummary) => void;
}

const ALL_TYPES = 'ALL' as const;
const ALL_CLASSIFICATIONS = 'ALL' as const;

/** Filter options with API query param mapping */
const FILTER_OPTIONS = [
  { label: 'Todos', value: ALL_TYPES },
  { label: 'Servicios', value: 'service' },
  { label: 'Productos', value: 'product' },
  { label: 'Herramientas', value: 'tool' },
  { label: 'Casos de Éxito', value: 'successCase' },
] as const;

const ITEMS_PER_PAGE = 12;

export function ProjectList({ onSelectProject }: ProjectListProps) {
  const [activeFilter, setActiveFilter] = useState<string>(ALL_TYPES);
  const [activeClassification, setActiveClassification] = useState<string>(ALL_CLASSIFICATIONS);
  const [page, setPage] = useState(1);

  const filters = useMemo(() => {
    const f: { type?: string; classification?: string; page?: number; limit?: number } = {};
    if (activeFilter !== ALL_TYPES) {
      f.type = activeFilter;
    }
    if (activeClassification !== ALL_CLASSIFICATIONS) {
      f.classification = activeClassification;
    }
    f.page = page;
    f.limit = ITEMS_PER_PAGE;
    return f;
  }, [activeFilter, activeClassification, page]);

  const { data, isLoading, isError, error, refetch } = useProjects(filters);
  const { data: classifications = [] } = useProjectClassifications();

  const projects = data?.data ?? [];
  const totalItems = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  /** Handle type filter change — reset classification and page */
  const handleFilterChange = (type: string) => {
    setActiveFilter(type);
    setActiveClassification(ALL_CLASSIFICATIONS);
    setPage(1);
  };

  /** Handle classification filter change — reset to page 1 */
  const handleClassificationChange = (classification: string) => {
    setActiveClassification(classification);
    setPage(1);
  };

  /** Handle pagination */
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.filters}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.filterButton} ${activeFilter === opt.value ? styles.filterButtonActive : ''}`}
              disabled
            >
              {opt.label}
            </button>
          ))}
        </div>
        {/* Classification filters */}
        {classifications.length > 0 && (
          <div className={styles.classificationFilters}>
            <button
              className={`${styles.classifButton} ${activeClassification === ALL_CLASSIFICATIONS ? styles.classifButtonActive : ''}`}
              disabled
            >
              Todas las categorías
            </button>
            {classifications.map((c) => (
              <button key={c} className={styles.classifButton} disabled>
                {c}
              </button>
            ))}
          </div>
        )}
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonBody}>
                <div className={styles.skeletonBadge} />
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonText} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (isError) {
    return (
      <div className={styles.container}>
        <div className={styles.filters}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.filterButton} ${activeFilter === opt.value ? styles.filterButtonActive : ''}`}
              disabled
            >
              {opt.label}
            </button>
          ))}
        </div>
        {/* Classification filters */}
        {classifications.length > 0 && (
          <div className={styles.classificationFilters}>
            <button
              className={`${styles.classifButton} ${activeClassification === ALL_CLASSIFICATIONS ? styles.classifButtonActive : ''}`}
              disabled
            >
              Todas las categorías
            </button>
            {classifications.map((c) => (
              <button key={c} className={styles.classifButton} disabled>
                {c}
              </button>
            ))}
          </div>
        )}
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorMessage}>
            No se pudieron cargar los proyectos.
          </p>
          <p className={styles.errorDetail}>
            {error instanceof Error ? error.message : 'Error de conexión'}
          </p>
          <button
            className={styles.retryButton}
            onClick={() => refetch()}
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (projects.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.filters}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.filterButton} ${activeFilter === opt.value ? styles.filterButtonActive : ''}`}
              onClick={() => handleFilterChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {/* Classification filters */}
        {classifications.length > 0 && (
          <div className={styles.classificationFilters}>
            <button
              className={`${styles.classifButton} ${activeClassification === ALL_CLASSIFICATIONS ? styles.classifButtonActive : ''}`}
              onClick={() => handleClassificationChange(ALL_CLASSIFICATIONS)}
            >
              Todas las categorías
            </button>
            {classifications.map((c) => (
              <button
                key={c}
                className={`${styles.classifButton} ${activeClassification === c ? styles.classifButtonActive : ''}`}
                onClick={() => handleClassificationChange(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <p className={styles.emptyMessage}>
            {activeClassification !== ALL_CLASSIFICATIONS
              ? `No se encontraron proyectos en la categoría "${activeClassification}".`
              : 'No se encontraron proyectos.'}
          </p>
          {(activeFilter !== ALL_TYPES || activeClassification !== ALL_CLASSIFICATIONS) && (
            <button
              className={styles.retryButton}
              onClick={() => {
                setActiveFilter(ALL_TYPES);
                setActiveClassification(ALL_CLASSIFICATIONS);
                setPage(1);
              }}
            >
              Ver todos
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Content state ──
  return (
    <div className={styles.container}>
      {/* Type filters */}
      <div className={styles.filters}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`${styles.filterButton} ${activeFilter === opt.value ? styles.filterButtonActive : ''}`}
            onClick={() => handleFilterChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Classification filters */}
      {classifications.length > 0 && (
        <div className={styles.classificationFilters}>
          <button
            className={`${styles.classifButton} ${activeClassification === ALL_CLASSIFICATIONS ? styles.classifButtonActive : ''}`}
            onClick={() => handleClassificationChange(ALL_CLASSIFICATIONS)}
          >
            Todas las categorías
          </button>
          {classifications.map((c) => (
            <button
              key={c}
              className={`${styles.classifButton} ${activeClassification === c ? styles.classifButtonActive : ''}`}
              onClick={() => handleClassificationChange(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Project grid */}
      <div className={styles.grid}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={onSelectProject}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
          >
            &laquo; Anterior
          </button>

          <div className={styles.pageInfo}>
            {renderPageNumbers(page, totalPages, handlePageChange)}
          </div>

          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Página siguiente"
          >
            Siguiente &raquo;
          </button>
        </div>
      )}

      {/* Results count */}
      <p className={styles.resultsCount}>
        {totalItems} proyecto{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
        {activeFilter !== ALL_TYPES && ` en ${FILTER_OPTIONS.find((o) => o.value === activeFilter)?.label.toLowerCase()}`}
        {activeClassification !== ALL_CLASSIFICATIONS && ` · categoría "${activeClassification}"`}
      </p>
    </div>
  );
}

/** Render pagination page numbers with ellipsis for large ranges */
function renderPageNumbers(
  current: number,
  total: number,
  onChange: (page: number) => void,
) {
  const pages: (number | 'ellipsis')[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);

    if (current > 3) pages.push('ellipsis');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('ellipsis');

    pages.push(total);
  }

  return pages.map((p, i) =>
    p === 'ellipsis' ? (
      <span key={`ellipsis-${i}`} className={styles.pageEllipsis}>
        &hellip;
      </span>
    ) : (
      <button
        key={p}
        className={`${styles.pageNumber} ${p === current ? styles.pageNumberActive : ''}`}
        onClick={() => onChange(p)}
        aria-label={`Ir a página ${p}`}
        aria-current={p === current ? 'page' : undefined}
      >
        {p}
      </button>
    ),
  );
}
