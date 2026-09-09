import { useEffect, useRef, useCallback, useState } from 'react';
import {
  sanitizeHtml,
  MediaCarousel,
  Lightbox,
} from '@jsoft/shared';
import type { MediaCarouselSlide, LightboxItem, EmblaCarouselType } from '@jsoft/shared';
import { useProjectDetail } from '../../hooks/useProjects';
import { useTranslation } from '../../i18n/LanguageContext';
import type { ProjectSummary } from '../../types';
import styles from './ProjectDetailModal.module.css';

interface ProjectDetailModalProps {
  project: ProjectSummary;
  onClose: () => void;
}

interface LightboxState {
  open: boolean;
  items: LightboxItem[];
  index: number;
}

const CLOSED_LIGHTBOX: LightboxState = { open: false, items: [], index: 0 };

/**
 * Normalizes API type values (lowercase or UPPERCASE) to the i18n key suffix.
 * The portfolio aggregation endpoint returns lowercase values; the legacy
 * UPPERCASE variants are kept as a defensive fallback.
 */
const TYPE_KEY_MAP: Record<string, string> = {
  service: 'service',
  product: 'product',
  tool: 'tool',
  successCase: 'successCase',
  project: 'project',
  laboratorio: 'laboratorio',
  SERVICE: 'service',
  PRODUCT: 'product',
  TOOL: 'tool',
  SUCCESS_CASE: 'successCase',
};

export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const { t } = useTranslation();
  const { isLoading, isError, error } = useProjectDetail(
    project.type,
    project.slug,
  );

  const overlayRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(CLOSED_LIGHTBOX);
  const carouselApiRef = useRef<EmblaCarouselType | null>(null);

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

  const projectImages: string[] = project.image
    ? [project.image, ...(project.images?.slice(1) ?? [])]
    : project.images ?? [];

  // Cover-first slides with the shared gallery alt template (D2).
  const slides: MediaCarouselSlide[] = projectImages.map((src, index) => ({
    src,
    alt: t('blogPostContent.galleryImageAlt', {
      title: project.title,
      index: index + 1,
      total: projectImages.length,
    }),
  }));

  const carouselLabels = {
    pause: t('blogPostContent.carousel.pause'),
    play: t('blogPostContent.carousel.play'),
    prev: t('blogPostContent.carousel.prev'),
    next: t('blogPostContent.carousel.next'),
    regionLabel: t('blogPostContent.galleryTitle'),
  };

  const lightboxLabels = {
    close: t('blogPostContent.lightbox.close'),
    prev: t('blogPostContent.lightbox.prev'),
    next: t('blogPostContent.lightbox.next'),
    counter: t('blogPostContent.lightbox.counter'),
    dialogLabel: t('blogPostContent.lightbox.dialogLabel'),
  };

  const openFromCarousel = (index: number) => {
    setLightbox({
      open: true,
      items: slides.map(
        (slide): LightboxItem => ({ kind: 'image', src: slide.src, alt: slide.alt }),
      ),
      index,
    });
  };

  const closeLightbox = () => setLightbox(CLOSED_LIGHTBOX);

  const typeLabelKey = `projectDetailModal.type.${TYPE_KEY_MAP[project.type] ?? project.type}`;
  const typeLabel = t(typeLabelKey);

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
            <span className={styles.typeIndicator}>{typeLabel}</span>
            <span className={styles.classification}>{project.classification}</span>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t('projectDetailModal.close')}
          >
            &times;
          </button>
        </div>

        {/* ── Title ── */}
        <h2 className={styles.title}>{project.title}</h2>

        {/* ── Description ── */}
        <p
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.shortDescription) }}
        />

        {/* ── Cover-first media carousel ── */}
        {projectImages.length > 0 && (
          <section className={styles.carousel}>
            <MediaCarousel
              slides={slides}
              labels={carouselLabels}
              apiRef={carouselApiRef}
              onSlideClick={openFromCarousel}
            />
          </section>
        )}

        {/* ── Loading state ── */}
        {isLoading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>{t('projectDetailModal.loading')}</p>
          </div>
        )}

        {/* ── Error state ── */}
        {isError && (
          <div className={styles.errorState}>
            <p>{t('projectDetailModal.error')}</p>
            <p className={styles.errorDetail}>
              {error instanceof Error
                ? error.message
                : t('projectDetailModal.errorConnection')}
            </p>
          </div>
        )}

        <Lightbox
          isOpen={lightbox.open}
          items={lightbox.items}
          initialIndex={lightbox.index}
          labels={lightboxLabels}
          onClose={closeLightbox}
          onIndexChange={(index) => carouselApiRef.current?.scrollTo(index)}
        />
      </div>
    </div>
  );
}