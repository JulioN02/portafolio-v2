import { useRef, useEffect, useState } from 'react';
import {
  renderSimulatorEmbeds,
  sanitizeHtml,
  MediaCarousel,
  Lightbox,
  prepareLightboxMedia,
  useMediaClickDelegation,
} from '@jsoft/shared';
import type { BlogPostResponse, EmblaCarouselType } from '@jsoft/shared';
import type { MediaCarouselSlide, LightboxItem } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import styles from './BlogPostContent.module.css';

interface BlogPostContentProps {
  post: BlogPostResponse;
}

interface LightboxState {
  open: boolean;
  items: LightboxItem[];
  index: number;
}

const CLOSED_LIGHTBOX: LightboxState = { open: false, items: [], index: 0 };

/**
 * Formats a date string to Spanish locale (es-ES).
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const { t } = useTranslation();
  const bodyRef = useRef<HTMLDivElement>(null);
  const carouselApiRef = useRef<EmblaCarouselType | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(CLOSED_LIGHTBOX);

  const sanitizedBody = renderSimulatorEmbeds(post.body);
  const sanitizedLessons = post.lessonsLearned
    ? renderSimulatorEmbeds(post.lessonsLearned)
    : null;

  // Cover-first slides: coverImage is slide 1, then each gallery image in
  // array order. Alt text comes from the i18n template.
  const galleryCount = post.mediaGallery?.length ?? 0;
  const slides: MediaCarouselSlide[] = [
    { src: post.coverImage, alt: post.title },
    ...(post.mediaGallery ?? []).map((src, index) => ({
      src,
      alt: t('blogPostContent.galleryImageAlt', {
        title: post.title,
        index: index + 2,
        total: galleryCount + 1,
      }),
    })),
  ];

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

  // The body is rendered through dangerouslySetInnerHTML with the ALREADY
  // sanitized HTML (renderSimulatorEmbeds). Lightbox wiring is a DOM pass +
  // one delegated click listener on the rendered container — no new
  // dangerouslySetInnerHTML paths.
  useEffect(() => {
    if (bodyRef.current) {
      prepareLightboxMedia(bodyRef.current, t('blogPostContent.media.expand'));
    }
  }, [t, post.body]);

  const openFromCarousel = (index: number) => {
    setLightbox({
      open: true,
      items: slides.map(
        (slide): LightboxItem => ({ kind: 'image', src: slide.src, alt: slide.alt }),
      ),
      index,
    });
  };

  const openFromBody = (item: LightboxItem) => {
    setLightbox({ open: true, items: [item], index: 0 });
  };

  const closeLightbox = () => setLightbox(CLOSED_LIGHTBOX);

  useMediaClickDelegation(bodyRef, (item) => {
    openFromBody(item);
  });

  return (
    <article className={styles.article}>
      {/* Cover-first unified media carousel (cover + gallery) */}
      <section className={styles.gallerySection}>
        {galleryCount > 0 && (
          <h2 className={styles.galleryTitle}>{t('blogPostContent.galleryTitle')}</h2>
        )}
        <MediaCarousel
          slides={slides}
          labels={carouselLabels}
          apiRef={carouselApiRef}
          onSlideClick={openFromCarousel}
        />
      </section>

      {/* Header */}
      <header className={styles.header}>
        <span className={styles.category}>{post.category}</span>
        <h1 className={styles.title}>{post.title}</h1>
        {post.shortDescription && (
          <div
            className={styles.lead}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.shortDescription) }}
          />
        )}
        <time
          className={styles.date}
          dateTime={String(post.publishedAt ?? post.createdAt)}
        >
          {formatDate(String(post.publishedAt ?? post.createdAt))}
        </time>
      </header>

      {/* Body (sanitized HTML) */}
      <div
        ref={bodyRef}
        className={styles.body}
        dangerouslySetInnerHTML={{ __html: sanitizedBody }}
      />

      {/* Lessons Learned */}
      {sanitizedLessons && (
        <section className={styles.lessonsSection}>
          <h2 className={styles.lessonsTitle}>{t('blogPostContent.lessonsTitle')}</h2>
          <div
            className={styles.lessonsContent}
            dangerouslySetInnerHTML={{ __html: sanitizedLessons }}
          />
        </section>
      )}

      {/* External Link */}
      {post.externalLink && (
        <div className={styles.externalLinkWrapper}>
          <a
            href={post.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            <span className={styles.externalLinkIcon}>🔗</span>
            {t('blogPostContent.externalLink')}
          </a>
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
    </article>
  );
}