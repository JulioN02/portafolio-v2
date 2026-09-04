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

export function BlogPostContent({ post }: BlogPostContentProps) {
  const { t } = useTranslation();
  const bodyRef = useRef<HTMLDivElement>(null);
  const carouselApiRef = useRef<EmblaCarouselType | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(CLOSED_LIGHTBOX);

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

  // Body is rendered ONLY through the sanitized pipeline
  // (renderSimulatorEmbeds → sanitizeHtml). Lightbox wiring is a DOM pass +
  // one delegated click listener on the already-sanitized container — no new
  // dangerouslySetInnerHTML paths.
  useEffect(() => {
    if (bodyRef.current && post.body) {
      bodyRef.current.innerHTML = renderSimulatorEmbeds(post.body);
      prepareLightboxMedia(bodyRef.current, t('blogPostContent.media.expand'));
    }
  }, [post.body, t]);

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

  const date = new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className={styles.article}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.category}>{post.category}</span>
          <span className={styles.date}>{date}</span>
        </div>
        <h1 className={styles.title}>{post.title}</h1>
        {post.shortDescription && (
          <div
            className={styles.lead}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.shortDescription) }}
          />
        )}
      </header>

      {/* Cover-first unified media carousel (cover + gallery) */}
      <section className={styles.gallery}>
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

      {/* Body (sanitized HTML) */}
      <div ref={bodyRef} className={styles.body} />

      {/* Lessons Learned */}
      {post.lessonsLearned && (
        <section className={styles.lessons}>
          <h2 className={styles.lessonsTitle}>Lecciones aprendidas</h2>
          <div
            className={styles.lessonsContent}
            dangerouslySetInnerHTML={{ __html: renderSimulatorEmbeds(post.lessonsLearned) }}
          />
        </section>
      )}

      {/* External Link */}
      {post.externalLink && (
        <div className={styles.externalLink}>
          <a
            href={post.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLinkButton}
          >
            Ver proyecto en GitHub →
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