import { useEffect, useRef, useCallback, useState } from 'react';
import {
  renderSimulatorEmbeds,
  sanitizeHtml,
  MediaCarousel,
  Lightbox,
  prepareLightboxMedia,
  useMediaClickDelegation,
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
  const { data: detail, isLoading, isError, error } = useProjectDetail(
    project.type,
    project.slug,
  );

  const overlayRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState>(CLOSED_LIGHTBOX);
  const carouselApiRef = useRef<EmblaCarouselType | null>(null);
  // Always-mounted rich wrapper (D3): the expanded rich sections mount
  // conditionally INSIDE it so the delegated lightbox listener (attached once
  // via useMediaClickDelegation) stays live and prepareLightboxMedia can
  // re-run when the sections mount.
  const richRef = useRef<HTMLDivElement>(null);
  const fullDescriptionRef = useRef<HTMLDivElement>(null);
  const technicalExplanationRef = useRef<HTMLDivElement>(null);
  const projectBodyRef = useRef<HTMLDivElement>(null);

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

  // Per-entity detail fields (detail is authoritative; summary fields are the
  // pre-fetch fallback for technicalExplanation/technicalImages).
  const detailRecord = detail as Record<string, unknown> | undefined;
  const isProject = project.type === 'project';
  const isSuccessCase = project.type === 'successCase';
  const fullDescription = detail
    ? (detailRecord?.fullDescription as string | undefined)
    : undefined;
  const technicalExplanation = detail
    ? ((detailRecord?.technicalExplanation as string | undefined) ??
      project.technicalExplanation)
    : project.technicalExplanation;
  const technicalImages: string[] = detail
    ? ((detailRecord?.technicalImages as string[] | undefined) ??
      project.technicalImages ??
      [])
    : project.technicalImages ?? [];
  const projectBody = detail ? (detailRecord?.body as string | undefined) : undefined;
  const projectRepositoryUrl = detail
    ? (detailRecord?.repositoryUrl as string | undefined)
    : undefined;
  const successCaseVideos: string[] = detail
    ? ((detailRecord?.videos as string[] | undefined) ?? [])
    : [];
  const successCaseLinks: string[] = detail
    ? ((detailRecord?.links as string[] | undefined) ?? [])
    : [];

  // D4 gating: hidden on error or when there is nothing extra beyond the
  // preview; disabled (never hidden) while the detail request is pending.
  const canExpand = (() => {
    if (isError) return false;
    if (isProject) return true;
    if (isSuccessCase) {
      return successCaseVideos.length > 0 || successCaseLinks.length > 0;
    }
    return Boolean(fullDescription || technicalExplanation || technicalImages.length > 0);
  })();

  const showExpanded = expanded && !isLoading && !isError && Boolean(detail);

  // Rich expanded content is rendered ONLY through the sanitized pipeline
  // (renderSimulatorEmbeds → sanitize, never raw dangerouslySetInnerHTML).
  // prepareLightboxMedia re-runs whenever the sections mount (expand/detail).
  useEffect(() => {
    if (!expanded || isLoading || isError) return;
    if (fullDescriptionRef.current && fullDescription) {
      fullDescriptionRef.current.innerHTML = renderSimulatorEmbeds(fullDescription);
    }
    if (technicalExplanationRef.current && technicalExplanation) {
      technicalExplanationRef.current.innerHTML = renderSimulatorEmbeds(
        technicalExplanation,
      );
    }
    if (projectBodyRef.current && projectBody) {
      projectBodyRef.current.innerHTML = renderSimulatorEmbeds(projectBody);
    }
    if (richRef.current) {
      prepareLightboxMedia(richRef.current, t('blogPostContent.media.expand'));
    }
  }, [
    expanded,
    isLoading,
    isError,
    fullDescription,
    technicalExplanation,
    projectBody,
    t,
  ]);

  const openFromCarousel = (index: number) => {
    setLightbox({
      open: true,
      items: slides.map(
        (slide): LightboxItem => ({ kind: 'image', src: slide.src, alt: slide.alt }),
      ),
      index,
    });
  };

  const openFromTechnicalImage = (index: number) => {
    const items = technicalImages.map(
      (src): LightboxItem => ({ kind: 'image', src }),
    );
    setLightbox({ open: true, items, index });
  };

  const handleMediaClick = useCallback((item: LightboxItem) => {
    setLightbox({ open: true, items: [item], index: 0 });
  }, []);

  const closeLightbox = () => setLightbox(CLOSED_LIGHTBOX);

  useMediaClickDelegation(richRef, handleMediaClick);

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

        {/* ── Expand / collapse (hidden on error; disabled while loading) ── */}
        {!isError && canExpand && (
          <button
            type="button"
            className={styles.expandButton}
            disabled={isLoading}
            aria-expanded={expanded}
            aria-controls="project-detail-rich"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? t('projectDetailModal.collapse') : t('projectDetailModal.expand')}
          </button>
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

        {/* ── Project branch: tags + body + repository link ── */}
        {showExpanded && isProject && project.tags && project.tags.length > 0 && (
          <div className={styles.tagsSection}>
            {project.tags.map((tag) => (
              <span key={tag} className={styles.tagChip}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Always-mounted rich wrapper (D3): rich expanded sections mount inside */}
        <div ref={richRef} id="project-detail-rich" className={styles.rich}>
          {showExpanded && isProject && projectBody && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                {t('projectDetailModal.fullDescription')}
              </h3>
              <div ref={projectBodyRef} className={styles.technicalContent} />
            </section>
          )}
          {showExpanded && !isProject && !isSuccessCase && fullDescription && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                {t('projectDetailModal.fullDescription')}
              </h3>
              <div ref={fullDescriptionRef} className={styles.technicalContent} />
            </section>
          )}
          {showExpanded && !isProject && !isSuccessCase && technicalExplanation && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                {t('projectDetailModal.technicalExplanation')}
              </h3>
              <div ref={technicalExplanationRef} className={styles.technicalContent} />
            </section>
          )}
        </div>

        {/* ── Project branch: repository link ── */}
        {showExpanded && isProject && projectRepositoryUrl && (
          <a
            href={projectRepositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.repoLink}
          >
            {t('projectDetailModal.viewRepository')}
          </a>
        )}

        {/* ── Technical images grid → single-item Lightbox (D5). React-rendered,
            OUTSIDE richRef so the delegated listener never double-fires. ── */}
        {showExpanded && !isProject && !isSuccessCase && technicalImages.length > 0 && (
          <section className={styles.techImagesSection}>
            <h3 className={styles.sectionTitle}>
              {t('projectDetailModal.technicalImages')}
            </h3>
            <div className={styles.techImagesGrid}>
              {technicalImages.map((img, index) => (
                <button
                  key={img}
                  type="button"
                  className={styles.technicalThumb}
                  onClick={() => openFromTechnicalImage(index)}
                  aria-label={t('blogPostContent.galleryImageAlt', {
                    title: project.title,
                    index: index + 1,
                    total: technicalImages.length,
                  })}
                >
                  <img src={img} alt="" className={styles.techImage} loading="lazy" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── SuccessCase branch: native videos + links (D5) ── */}
        {showExpanded && isSuccessCase && (
          <>
            {successCaseVideos.length > 0 && (
              <section className={styles.section}>
                {successCaseVideos.map((src) => (
                  <video key={src} src={src} controls className={styles.successVideo} />
                ))}
              </section>
            )}
            {successCaseLinks.length > 0 && (
              <section className={styles.section}>
                {successCaseLinks.map((href) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.successLink}
                  >
                    {href}
                  </a>
                ))}
              </section>
            )}
          </>
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