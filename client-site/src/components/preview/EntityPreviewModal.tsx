import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sanitizeHtml, MediaCarousel, Lightbox } from '@jsoft/shared';
import type {
  ServiceResponse,
  ProductResponse,
  ToolResponse,
  SuccessCaseResponse,
  ProjectResponse,
  EmblaCarouselType,
  MediaCarouselSlide,
  LightboxItem,
} from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { entityDetailPath } from '../../constants/entityRoutes';
import styles from './EntityPreviewModal.module.css';

/**
 * Content-only preview for the 5 client entity types. The caller wraps it in
 * the shared Modal on list pages. ZERO fetch — the list payload is the full
 * SELECT, so preview fields (classification/title/shortDescription/images)
 * are already present. "Ver Completo" (ALWAYS present) closes the modal and
 * navigates to the type's detail page via ROUTE_MAP — the modal never expands.
 */
export type PreviewEntity =
  | { type: 'service'; entity: ServiceResponse }
  | { type: 'product'; entity: ProductResponse }
  | { type: 'tool'; entity: ToolResponse }
  | { type: 'successCase'; entity: SuccessCaseResponse }
  | { type: 'project'; entity: ProjectResponse };

interface EntityPreviewModalProps {
  preview: PreviewEntity;
  /** Closes the modal BEFORE navigating (state reset unmounts the shared Modal). */
  onClose: () => void;
}

const FALLBACK_IMG = 'https://placehold.co/600x400/e5e7eb/9ca3af?text=Sin+imagen';

interface LightboxState {
  open: boolean;
  items: LightboxItem[];
  index: number;
}

const CLOSED_LIGHTBOX: LightboxState = { open: false, items: [], index: 0 };

export function EntityPreviewModal({ preview, onClose }: EntityPreviewModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState<LightboxState>(CLOSED_LIGHTBOX);
  const carouselApiRef = useRef<EmblaCarouselType | null>(null);

  const { type, entity } = preview;
  const title = entity.title;

  // service/product/tool carry classification; project/successCase do not
  // (aggregation-only field) → conditional header, no empty chip.
  const classification =
    type === 'service' || type === 'product' || type === 'tool'
      ? entity.classification
      : null;

  // project images are OPTIONAL → fall back to the placeholder slide so the
  // carousel section never renders broken/empty media.
  const rawImages = 'images' in entity ? (entity.images ?? []) : [];
  const images = rawImages.length > 0 ? rawImages : [FALLBACK_IMG];

  const slides: MediaCarouselSlide[] = images.map((src, index) => ({
    src,
    alt: t('blogPostContent.galleryImageAlt', {
      title,
      index: index + 1,
      total: images.length,
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
    // onClose() first: the list page sets the selection to null and the shared
    // Modal unmounts; then the route change lands on the detail page.
    onClose();
    navigate(entityDetailPath(type, entity.slug));
  };

  return (
    <div className={styles.content}>
      <header className={styles.header}>
        {classification && <span className={styles.classification}>{classification}</span>}
        <h2 className={styles.title}>{title}</h2>
        {type === 'successCase' ? (
          <p className={styles.description}>{entity.description}</p>
        ) : (
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(entity.shortDescription) }}
          />
        )}
        {type === 'tool' && entity.requiresInstall && (
          <div className={styles.installBadge}>{t('toolDetail.requiresInstall')}</div>
        )}
        {type === 'project' && entity.tags && entity.tags.length > 0 && (
          <span className={styles.tagChip}>{entity.tags[0]}</span>
        )}
      </header>

      {/* Cover-first media carousel → Lightbox */}
      <section className={styles.gallery}>
        <MediaCarousel
          slides={slides}
          labels={carouselLabels}
          apiRef={carouselApiRef}
          onSlideClick={openFromCarousel}
        />
      </section>

      {/* "Ver Completo" — always present, NAVIGATES (never expands) */}
      <button type="button" className={styles.expandButton} onClick={handleViewFull}>
        {t('toolDetail.expand')}
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
  );
}