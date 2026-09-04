/**
 * MediaCarousel — cover-first Embla carousel for blog media.
 *
 * Renders the cover image as slide 1 followed by the gallery slides. Full,
 * centered, uncropped thumbnails via object-fit:contain inside a fixed 16/9
 * frame. Autoplay (manual setInterval, default 5000ms) animates the current
 * slide out LEFT while the next enters FROM the RIGHT (Embla's default
 * negative-X transform). Honors prefers-reduced-motion: autoplay never starts.
 * A single slide renders static: no autoplay, no prev/next, no pause control.
 *
 * NOTE: Class names are defined inline instead of CSS module import
 * because tsup strips CSS module mappings during build.
 * The corresponding styles live in MediaCarousel.module.css and are bundled
 * into dist/index.css — import '@jsoft/shared/dist/index.css' to load them.
 */
import { useEffect, useRef, useState, type KeyboardEvent, type MutableRefObject } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType } from 'embla-carousel';

const styles = {
  region: 'mc-region',
  viewport: 'mc-viewport',
  container: 'mc-container',
  slide: 'mc-slide',
  slideButton: 'mc-slideButton',
  slideFrame: 'mc-slideFrame',
  slideImage: 'mc-slideImage',
  controls: 'mc-controls',
  navButton: 'mc-navButton',
  prevButton: 'mc-prevButton',
  nextButton: 'mc-nextButton',
  pauseButton: 'mc-pauseButton',
};

export interface MediaCarouselSlide {
  src: string;
  alt: string;
}

export interface MediaCarouselLabels {
  pause: string;
  play: string;
  prev: string;
  next: string;
  regionLabel: string;
}

export interface MediaCarouselProps {
  slides: MediaCarouselSlide[];
  labels: MediaCarouselLabels;
  /** Whether autoplay is enabled (reduced-motion is checked internally). Default true. */
  autoplay?: boolean;
  /** Autoplay interval in ms. Default 5000. */
  autoplayInterval?: number;
  /** Fired when a slide is activated (click / Enter / Space). */
  onSlideClick?: (index: number) => void;
  /** Parent handle to the embla API (e.g. to scrollTo from a lightbox). */
  apiRef?: MutableRefObject<EmblaCarouselType | null>;
}

export function MediaCarousel({
  slides,
  labels,
  autoplay = true,
  autoplayInterval = 5000,
  onSlideClick,
  apiRef,
}: MediaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);

  const reducedMotionRef = useRef(false);

  const slideCount = slides.length;
  const singleSlide = slideCount < 2;
  const effectivePaused = isPaused || hoverPaused;

  // Reduced-motion detection: autoplay must never start under
  // prefers-reduced-motion: reduce.
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      reducedMotionRef.current = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
    }
  }, []);

  // Expose the embla api to the parent.
  useEffect(() => {
    if (apiRef) apiRef.current = emblaApi ?? null;
    return () => {
      if (apiRef) apiRef.current = null;
    };
  }, [apiRef, emblaApi]);

  // Track the active slide (drives roving tabIndex + data-active-slide).
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Manual autoplay: a plain setInterval calling scrollNext. The interval is
  // torn down while paused (pause control or hover) and restarted on resume.
  useEffect(() => {
    if (!emblaApi || singleSlide || !autoplay || reducedMotionRef.current) return;
    if (effectivePaused) return;
    const id = window.setInterval(() => {
      emblaApi.scrollNext();
    }, autoplayInterval);
    return () => window.clearInterval(id);
  }, [emblaApi, singleSlide, autoplay, autoplayInterval, effectivePaused]);

  // Keyboard arrows on the region (spec: SHOULD support ArrowLeft/ArrowRight).
  const handleRegionKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!emblaApi || singleSlide) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      emblaApi.scrollNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      emblaApi.scrollPrev();
    }
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <section
      className={styles.region}
      aria-label={labels.regionLabel}
      onKeyDown={handleRegionKeyDown}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
    >
      <div className={styles.viewport} ref={emblaRef}>
        <div className={styles.container}>
          {slides.map((slide, index) => (
            <div
              key={`${slide.src}-${index}`}
              className={styles.slide}
              data-active-slide={index === activeIndex ? 'true' : 'false'}
            >
              <button
                type="button"
                className={styles.slideButton}
                tabIndex={index === activeIndex ? 0 : -1}
                aria-label={slide.alt}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => onSlideClick?.(index)}
              >
                <span className={styles.slideFrame}>
                  <img
                    src={slide.src}
                    alt=""
                    className={styles.slideImage}
                    draggable={false}
                  />
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {!singleSlide && (
        <div className={styles.controls}>
          <button
            type="button"
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={() => emblaApi?.scrollPrev()}
            aria-label={labels.prev}
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={() => emblaApi?.scrollNext()}
            aria-label={labels.next}
          >
            ›
          </button>
          <button
            type="button"
            className={styles.pauseButton}
            onClick={togglePause}
            aria-pressed={isPaused}
            aria-label={isPaused ? labels.play : labels.pause}
          >
            {isPaused ? '▶' : '⏸'}
          </button>
        </div>
      )}
    </section>
  );
}

export type { EmblaCarouselType };