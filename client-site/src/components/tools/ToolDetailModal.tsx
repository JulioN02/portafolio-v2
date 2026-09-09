import { useRef, useEffect, useState } from 'react';
import {
  renderSimulatorEmbeds,
  sanitizeHtml,
  MediaCarousel,
  Lightbox,
  prepareLightboxMedia,
  useMediaClickDelegation,
  Modal,
} from '@jsoft/shared';
import type { ToolResponse, EmblaCarouselType } from '@jsoft/shared';
import type { MediaCarouselSlide, LightboxItem } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { ContactForm } from '../forms/ContactForm';
import styles from './ToolDetailModal.module.css';

interface ToolDetailModalProps {
  tool: ToolResponse;
  /** Open already expanded (deep-link page renders the modal inline). */
  initialExpanded?: boolean;
}

interface LightboxState {
  open: boolean;
  items: LightboxItem[];
  index: number;
}

const CLOSED_LIGHTBOX: LightboxState = { open: false, items: [], index: 0 };

/**
 * Content-only preview→expand tool detail (D1: no overlay — the caller wraps
 * it in a Modal on the list page or renders it inline on the deep-link page).
 * Preview: classification, title, sanitized shortDescription, requiresInstall
 * badge, MediaCarousel (images[0]=cover) and contact CTA. Expand: fullDescription
 * + technicalExplanation (sanitized rich content) + technicalImages grid.
 */
export function ToolDetailModal({ tool, initialExpanded = false }: ToolDetailModalProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(initialExpanded);
  const [lightbox, setLightbox] = useState<LightboxState>(CLOSED_LIGHTBOX);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const richRef = useRef<HTMLDivElement>(null);
  const fullDescriptionRef = useRef<HTMLDivElement>(null);
  const technicalExplanationRef = useRef<HTMLDivElement>(null);
  const carouselApiRef = useRef<EmblaCarouselType | null>(null);

  // Cover-first slides: images[0] is the cover (schema min 1). Alt text comes
  // from the shared blogPostContent template (D2).
  const slides: MediaCarouselSlide[] = tool.images.map((src, index) => ({
    src,
    alt: t('blogPostContent.galleryImageAlt', {
      title: tool.title,
      index: index + 1,
      total: tool.images.length,
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

  // Rich content is rendered ONLY through the sanitized pipeline
  // (renderSimulatorEmbeds → sanitizeHtml, never dangerouslySetInnerHTML with
  // raw input). The wrapper ref is ALWAYS mounted (D3/D7) so the delegated
  // lightbox listener stays attached; the expanded sections mount
  // conditionally inside it and prepareLightboxMedia re-runs on expand.
  useEffect(() => {
    if (!expanded) return;
    if (fullDescriptionRef.current && tool.fullDescription) {
      fullDescriptionRef.current.innerHTML = renderSimulatorEmbeds(tool.fullDescription);
    }
    if (technicalExplanationRef.current && tool.technicalExplanation) {
      technicalExplanationRef.current.innerHTML = renderSimulatorEmbeds(
        tool.technicalExplanation,
      );
    }
    if (richRef.current) {
      prepareLightboxMedia(richRef.current, t('blogPostContent.media.expand'));
    }
  }, [expanded, tool.fullDescription, tool.technicalExplanation, t]);

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
    const items = (tool.technicalImages ?? []).map(
      (src): LightboxItem => ({ kind: 'image', src }),
    );
    setLightbox({ open: true, items, index });
  };

  const openFromBody = (item: LightboxItem) => {
    setLightbox({ open: true, items: [item], index: 0 });
  };

  const closeLightbox = () => setLightbox(CLOSED_LIGHTBOX);

  useMediaClickDelegation(richRef, (item) => {
    openFromBody(item);
  });

  const technicalImages = tool.technicalImages ?? [];

  return (
    <article className={styles.article} aria-label={t('toolDetail.modalAria')}>
      {/* Preview header */}
      <header className={styles.header}>
        <span className={styles.classification}>{tool.classification}</span>
        <h2 className={styles.title}>{tool.title}</h2>
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(tool.shortDescription) }}
        />
        {tool.requiresInstall && (
          <div className={styles.installBadge}>{t('toolDetail.requiresInstall')}</div>
        )}
      </header>

      {/* Cover-first media carousel */}
      <section className={styles.gallery}>
        <MediaCarousel
          slides={slides}
          labels={carouselLabels}
          apiRef={carouselApiRef}
          onSlideClick={openFromCarousel}
        />
      </section>

      {/* Expand / collapse */}
      <button
        type="button"
        className={styles.expandButton}
        aria-expanded={expanded}
        aria-controls="tool-detail-rich"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? t('toolDetail.collapse') : t('toolDetail.expand')}
      </button>

      {/* Always-mounted rich wrapper (D3/D7): expanded sections mount inside */}
      <div ref={richRef} id="tool-detail-rich" className={styles.rich}>
        {expanded && tool.fullDescription && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('toolDetail.fullDescription')}</h3>
            <div ref={fullDescriptionRef} className={styles.sectionBody} />
          </section>
        )}
        {expanded && tool.technicalExplanation && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('toolDetail.technicalExplanation')}</h3>
            <div ref={technicalExplanationRef} className={styles.sectionBody} />
          </section>
        )}
      </div>

      {/* Technical images grid → single-item Lightbox (D5). React-rendered,
          OUTSIDE richRef so delegation never double-fires on grid clicks. */}
      {expanded && technicalImages.length > 0 && (
        <section className={styles.technicalSection}>
          <h3 className={styles.sectionTitle}>{t('toolDetail.technicalImages')}</h3>
          <div className={styles.technicalGrid}>
            {technicalImages.map((src, index) => (
              <button
                key={src}
                type="button"
                className={styles.technicalThumb}
                onClick={() => openFromTechnicalImage(index)}
                aria-label={t('blogPostContent.galleryImageAlt', {
                  title: tool.title,
                  index: index + 1,
                  total: technicalImages.length,
                })}
              >
                <img src={src} alt="" className={styles.technicalImage} loading="lazy" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Contact CTA (nested Modal; ESC closes both layers — D6) */}
      <button
        type="button"
        className={styles.ctaButton}
        onClick={() => setIsContactModalOpen(true)}
      >
        {t('toolDetail.requestInfo')}
      </button>

      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title={t('toolDetail.requestInfo')}
      >
        <ContactForm
          source={`tool:${tool.title}`}
          onSuccess={() => setIsContactModalOpen(false)}
        />
      </Modal>

      <Lightbox
        isOpen={lightbox.open}
        items={lightbox.items}
        initialIndex={lightbox.index}
        labels={lightboxLabels}
        onClose={closeLightbox}
        onIndexChange={(index) => carouselApiRef.current?.scrollTo(index)}
      />
    </article>
  );
}