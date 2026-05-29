import { useEffect, useRef, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { useProjectDetail } from '../../hooks/useProjects';
import type { ProjectSummary } from '../../types';
import styles from './ProjectDetailModal.module.css';

interface ProjectDetailModalProps {
  project: ProjectSummary;
  onClose: () => void;
}

/** Maps API type values to Spanish labels */
const typeLabels: Record<string, string> = {
  service: 'Servicio',
  product: 'Producto',
  tool: 'Herramienta',
  successCase: 'Caso de Éxito',
  SERVICE: 'Servicio',
  PRODUCT: 'Producto',
  TOOL: 'Herramienta',
  SUCCESS_CASE: 'Caso de Éxito',
};

export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const { data: detail, isLoading, isError, error } = useProjectDetail(
    project.type,
    project.slug,
  );

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  // Close on backdrop click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const hasMultipleImages =
    project.images && project.images.length > 1;
  const hasTechnicalImages =
    detail &&
    Array.isArray((detail as Record<string, unknown>).technicalImages) &&
    ((detail as Record<string, unknown>).technicalImages as string[]).length > 0;
  const technicalExplanation = detail
    ? ((detail as Record<string, unknown>).technicalExplanation as string | undefined)
    : project.technicalExplanation;

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <div className={styles.modal}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <span className={styles.typeIndicator}>
              {typeLabels[project.type] ?? project.type}
            </span>
            <span className={styles.classification}>
              {project.classification}
            </span>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        {/* ── Title ── */}
        <h2 className={styles.title}>{project.title}</h2>

        {/* ── Description ── */}
        <p className={styles.description}>{project.shortDescription}</p>

        {/* ── Main image ── */}
        {project.images && project.images.length > 0 && (
          <div className={styles.mainImageWrapper}>
            <img
              src={project.images[0]}
              alt={project.title}
              className={styles.mainImage}
              loading="lazy"
            />
          </div>
        )}

        {/* ── Image gallery ── */}
        {hasMultipleImages && (
          <div className={styles.gallery}>
            <h3 className={styles.sectionTitle}>Galería</h3>
            <div className={styles.galleryGrid}>
              {project.images.slice(1).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${project.title} - Imagen ${i + 2}`}
                  className={styles.galleryImage}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Loading state ── */}
        {isLoading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Cargando detalles técnicos...</p>
          </div>
        )}

        {/* ── Error state ── */}
        {isError && (
          <div className={styles.errorState}>
            <p>No se pudieron cargar los detalles del proyecto.</p>
            <p className={styles.errorDetail}>
              {error instanceof Error ? error.message : 'Error de conexión'}
            </p>
          </div>
        )}

        {/* ── Technical explanation (sanitized HTML) ── */}
        {!isLoading && !isError && technicalExplanation && (
          <div className={styles.technicalSection}>
            <h3 className={styles.sectionTitle}>Detalles Técnicos</h3>
            <div
              ref={contentRef}
              className={styles.technicalContent}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(technicalExplanation),
              }}
            />
          </div>
        )}

        {/* ── Technical images gallery ── */}
        {!isLoading && !isError && hasTechnicalImages && (
          <div className={styles.techImagesSection}>
            <h3 className={styles.sectionTitle}>Imágenes Técnicas</h3>
            <div className={styles.techImagesGrid}>
              {(
                (detail as Record<string, unknown>)
                  .technicalImages as string[]
              ).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${project.title} - Técnico ${i + 1}`}
                  className={styles.techImage}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
