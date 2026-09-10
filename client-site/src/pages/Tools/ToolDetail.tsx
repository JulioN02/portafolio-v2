import { useRef, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  renderSimulatorEmbeds,
  sanitizeHtml,
  MediaCarousel,
  Lightbox,
  prepareLightboxMedia,
  useMediaClickDelegation,
  Modal,
} from '@jsoft/shared';
import type {
  EmblaCarouselType,
  MediaCarouselSlide,
  LightboxItem,
} from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToolBySlug } from '../../hooks/useTools';
import { Loading } from '../../components/common/Loading';
import { MetaTags } from '../../components/seo/MetaTags';
import { ContactForm } from '../../components/forms/ContactForm';
import styles from './ToolDetail.module.css';

interface LightboxState {
  open: boolean;
  items: LightboxItem[];
  index: number;
}

const CLOSED_LIGHTBOX: LightboxState = { open: false, items: [], index: 0 };

export function ToolDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: tool, isLoading, error } = useToolBySlug(slug || '');

  // Hooks stay unconditional (rules of hooks) — the effects guard on `tool`.
  const [lightbox, setLightbox] = useState<LightboxState>(CLOSED_LIGHTBOX);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const richRef = useRef<HTMLDivElement>(null);
  const fullDescriptionRef = useRef<HTMLDivElement>(null);
  const technicalExplanationRef = useRef<HTMLDivElement>(null);
  const carouselApiRef = useRef<EmblaCarouselType | null>(null);

  // Rich content is rendered ONLY through the sanitized pipeline
  // (renderSimulatorEmbeds → sanitizeHtml, never raw dangerouslySetInnerHTML).
  // The wrapper ref is ALWAYS mounted so the delegated lightbox listener stays
  // attached; prepareLightboxMedia re-runs when the tool resolves.
  useEffect(() => {
    if (!tool) return;
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
  }, [tool, t]);

  useMediaClickDelegation(richRef, (item) => {
    setLightbox({ open: true, items: [item], index: 0 });
  });

  if (isLoading) return <Loading fullPage message={t('toolDetail.loading')} />;

  if (error || !tool) {
    return (
      <div className={styles.error}>
        <h2>{t('toolDetail.notFound.title')}</h2>
        <p>{t('toolDetail.notFound.message')}</p>
        <Link to="/herramientas" className={styles.backLink}>
          {t('toolDetail.backToTools')}
        </Link>
      </div>
    );
  }

  // Cover-first slides: images[0] is the cover (schema min 1).
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

  const closeLightbox = () => setLightbox(CLOSED_LIGHTBOX);

  const technicalImages = tool.technicalImages ?? [];

  return (
    <div className={styles.page}>
      <MetaTags
        title={`${tool.title} | J Soft Solutions`}
        description={tool.shortDescription}
      />
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/herramientas">{t('toolDetail.breadcrumb.tools')}</Link>
          <span>/</span>
          <span>{tool.title}</span>
        </nav>

        {/* Prominent back link at the top */}
        <Link to="/herramientas" className={styles.backLink}>
          {t('toolDetail.backToTools')}
        </Link>

        {/* Full content header */}
        <header className={styles.header}>
          <span className={styles.classification}>{tool.classification}</span>
          <h1 className={styles.title}>{tool.title}</h1>
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(tool.shortDescription) }}
          />
          {tool.requiresInstall && (
            <div className={styles.installBadge}>{t('toolDetail.requiresInstall')}</div>
          )}
          {tool.externalLink && (
            <a
              href={tool.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLink}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
              </svg>
              {t('toolDetail.viewWebsite')}
            </a>
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

        {/* Always-mounted rich wrapper: fullDescription + technicalExplanation
            mount inside it, so delegation stays attached and the lightbox
            handles late-arriving content (D3). */}
        <div ref={richRef} id="tool-detail-rich" className={styles.rich}>
          {tool.fullDescription && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('toolDetail.fullDescription')}</h2>
              <div ref={fullDescriptionRef} className={styles.sectionBody} />
            </section>
          )}
          {tool.technicalExplanation && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('toolDetail.technicalExplanation')}</h2>
              <div ref={technicalExplanationRef} className={styles.sectionBody} />
            </section>
          )}
        </div>

        {/* Technical images grid → Lightbox. React-rendered, OUTSIDE richRef so
            delegation never double-fires on grid clicks. */}
        {technicalImages.length > 0 && (
          <section className={styles.technicalSection}>
            <h2 className={styles.sectionTitle}>{t('toolDetail.technicalImages')}</h2>
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

        {/* Contact CTA */}
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
      </div>
    </div>
  );
}