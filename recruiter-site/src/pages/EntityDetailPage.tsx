import { useRef, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { sanitizeHtml, MediaCarousel, Lightbox } from '@jsoft/shared';
import type {
  EmblaCarouselType,
  MediaCarouselSlide,
  LightboxItem,
} from '@jsoft/shared';
import { useTranslation } from '../i18n/LanguageContext';
import { useProjectDetail } from '../hooks/useProjects';
import { MetaTags } from '../components/seo/MetaTags';
import { EntityDetailContent } from '../components/projects/EntityDetailContent';
import { normalizeEntityType } from '../constants/entityRoutes';
import styles from './EntityDetailPage.module.css';

/** Types that have a real detail page under /proyectos/:tipo/:slug. */
const DETAIL_TYPES = ['service', 'product', 'tool', 'successCase', 'project'] as const;

const FALLBACK_IMG = 'https://placehold.co/600x400/e5e7eb/9ca3af?text=Sin+imagen';

interface LightboxState {
  open: boolean;
  items: LightboxItem[];
  index: number;
}

const CLOSED_LIGHTBOX: LightboxState = { open: false, items: [], index: 0 };

export function EntityDetailPage() {
  const { t } = useTranslation();
  const { tipo = '', slug = '' } = useParams<{ tipo: string; slug: string }>();
  const { data: detail, isLoading, isError, error, refetch } = useProjectDetail(tipo, slug);
  const [lightbox, setLightbox] = useState<LightboxState>(CLOSED_LIGHTBOX);
  const carouselApiRef = useRef<EmblaCarouselType | null>(null);

  const normalizedType = normalizeEntityType(tipo);

  // laboratorio rows are blog posts, never entity details (defensive — the
  // Projects list already routes them to /blog/:slug).
  if (tipo === 'laboratorio' && slug) {
    return <Navigate to={`/blog/${slug}`} replace />;
  }

  // Unknown tipo → i18n not-found state with the back link (BlogPostPage pattern).
  if (!(DETAIL_TYPES as readonly string[]).includes(normalizedType)) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.backLink}>
            <Link to="/proyectos">{t('projectDetailPage.backToProjects')}</Link>
          </div>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>🔍</div>
            <h1 className={styles.errorTitle}>{t('projectDetailPage.notFound.title')}</h1>
            <p className={styles.errorMessage}>{t('projectDetailPage.notFound.message')}</p>
          </div>
        </div>
      </main>
    );
  }

  // ── Loading state: no partial sections while the detail is pending ──
  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.backLink}>
            <Link to="/proyectos">{t('projectDetailPage.backToProjects')}</Link>
          </div>
          <div className={styles.loadingState}>
            <div className={styles.skeleton} />
            <p className={styles.loadingText}>{t('projectDetailModal.loading')}</p>
          </div>
        </div>
      </main>
    );
  }

  // ── Error / missing detail state with retry ──
  if (isError || !detail) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.backLink}>
            <Link to="/proyectos">{t('projectDetailPage.backToProjects')}</Link>
          </div>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>⚠️</div>
            <h1 className={styles.errorTitle}>
              {isError
                ? t('projectDetailModal.error')
                : t('projectDetailPage.notFound.title')}
            </h1>
            <p className={styles.errorMessage}>
              {isError
                ? error instanceof Error
                  ? error.message
                  : t('projectDetailModal.errorConnection')
                : t('projectDetailPage.notFound.message')}
            </p>
            {isError && (
              <button type="button" className={styles.retryButton} onClick={() => refetch()}>
                {t('blogGrid.retry')}
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  const detailRecord = detail as Record<string, unknown>;
  const title = (detailRecord.title as string) ?? '';
  const typeLabelKey = `projectDetailModal.type.${normalizedType}`;
  const typeLabel = t(typeLabelKey);
  // Classification is aggregation-only — service/product/tool carry it,
  // project/successCase do NOT (D9) → conditional chip, no empty label.
  const classification = detailRecord.classification as string | undefined;
  const shortDescription =
    ((detailRecord.shortDescription as string | undefined) ??
      (detailRecord.description as string | undefined)) ??
    '';
  const rawImages = (detailRecord.images as string[] | undefined) ?? [];

  // Cover-first slides with dedup: if the cover (images[0]) repeats later in
  // the payload it is dropped so the carousel never shows it twice.
  const pageImages =
    rawImages.length > 1
      ? [rawImages[0], ...rawImages.slice(1).filter((src) => src !== rawImages[0])]
      : rawImages.length === 1
        ? [rawImages[0]]
        : [FALLBACK_IMG];

  const slides: MediaCarouselSlide[] = pageImages.map((src, index) => ({
    src,
    alt: t('blogPostContent.galleryImageAlt', {
      title,
      index: index + 1,
      total: pageImages.length,
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

  return (
    <main className={styles.page}>
      <MetaTags title={`${title} | Julio Nieto`} description={shortDescription} />
      <div className={styles.container}>
        <div className={styles.backLink}>
          <Link to="/proyectos">{t('projectDetailPage.backToProjects')}</Link>
        </div>

        {/* ── Header (D9): typeLabel + title + sanitized shortDescription + carousel ── */}
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <span className={styles.typeIndicator}>{typeLabel}</span>
            {classification && <span className={styles.classification}>{classification}</span>}
          </div>
          <h1 className={styles.title}>{title}</h1>
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(shortDescription) }}
          />
        </header>

        {/* ── Cover-first media carousel → page Lightbox (D7) ── */}
        <section className={styles.gallery}>
          <MediaCarousel
            slides={slides}
            labels={carouselLabels}
            apiRef={carouselApiRef}
            onSlideClick={openFromCarousel}
          />
        </section>

        {/* ── Per-type full content (rich sections + delegation + tech grid) ── */}
        <EntityDetailContent
          type={normalizedType}
          detail={detailRecord}
          title={title}
          onOpenLightbox={(items, index) => setLightbox({ open: true, items, index })}
        />

        <Lightbox
          isOpen={lightbox.open}
          items={lightbox.items}
          initialIndex={lightbox.index}
          labels={lightboxLabels}
          onClose={closeLightbox}
          onIndexChange={(index) => carouselApiRef.current?.scrollTo(index)}
        />
      </div>
    </main>
  );
}