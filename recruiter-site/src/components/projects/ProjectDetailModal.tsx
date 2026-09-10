import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sanitizeHtml, MediaCarousel, Lightbox } from '@jsoft/shared';
import type { MediaCarouselSlide, LightboxItem, EmblaCarouselType } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { entityDetailPath, normalizeEntityType } from '../../constants/entityRoutes';
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
 * Preview-only modal fed by the grid summary payload — ZERO fetch. "Ver
 * Completo" (ALWAYS present) closes the modal and navigates to the type's
 * detail page /proyectos/:tipo/:slug; the modal never expands. Full content
 * (rich sections, technical images, videos/links) lives on EntityDetailPage.
 */
export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(CLOSED_LIGHTBOX);
  const carouselApiRef = useRef<EmblaCarouselType | null>(null);

  // Close on Escape key. When the Lightbox is open it handles its own Escape
  // (closes first); a second Escape reaches the modal.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (lightbox.open) return;
      onClose();
    },
    [lightbox.open, onClose],
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

  // Cover-first slides with the shared gallery alt template.
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

  const handleViewFull = () => {
    // onClose() first: the list page resets the selection and unmounts the
    // modal; then the route change lands on the detail page.
    onClose();
    navigate(entityDetailPath(project.type, project.slug));
  };

  const typeLabelKey = `projectDetailModal.type.${normalizeEntityType(project.type)}`;
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

        {/* ── "Ver Completo": ALWAYS present → close + navigate (never expands) ── */}
        <button type="button" className={styles.primaryAction} onClick={handleViewFull}>
          {t('projectDetailModal.expand')}
        </button>

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