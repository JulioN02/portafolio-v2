/**
 * Lightbox — click-to-enlarge overlay for blog media (carousel slides and
 * body images/videos/simulator iframes).
 *
 * Opens ABOVE the article content as a dialog (role="dialog", aria-modal).
 * Closes on backdrop click, ESC, or scroll (wheel/touch over the overlay).
 * While open the page behind is scroll-locked (Modal pattern). Focus moves to
 * the close button on open and returns to the trigger element on close.
 * Carousel-opened lightboxes navigate with ArrowLeft/ArrowRight and prev/next
 * controls; body-media lightboxes are single-item (no navigation).
 *
 * NOTE: Class names are defined inline instead of CSS module import
 * because tsup strips CSS module mappings during build.
 * The corresponding styles live in Lightbox.module.css and are bundled
 * into dist/index.css — import '@jsoft/shared/dist/index.css' to load them.
 */
import { useEffect, useRef, useState } from 'react';
import type {
  KeyboardEvent as ReactKeyboardEvent,
  TouchEvent as ReactTouchEvent,
  WheelEvent as ReactWheelEvent,
} from 'react';

const styles = {
  overlay: 'lb-overlay',
  dialog: 'lb-dialog',
  closeButton: 'lb-closeButton',
  mediaWrapper: 'lb-mediaWrapper',
  mediaImage: 'lb-mediaImage',
  mediaVideo: 'lb-mediaVideo',
  mediaIframe: 'lb-mediaIframe',
  navButton: 'lb-navButton',
  prevButton: 'lb-prevButton',
  nextButton: 'lb-nextButton',
  counter: 'lb-counter',
};

export type LightboxItem = {
  kind: 'image' | 'video' | 'iframe';
  src: string;
  alt?: string;
  poster?: string;
  sandbox?: string;
  title?: string;
};

export interface LightboxLabels {
  close: string;
  prev: string;
  next: string;
  /** Counter template, e.g. "{current} de {total}". */
  counter: string;
  dialogLabel: string;
}

export interface LightboxProps {
  isOpen: boolean;
  items: LightboxItem[];
  initialIndex?: number;
  labels: LightboxLabels;
  onClose: () => void;
  /** Fired on index change so the parent can sync the carousel active slide. */
  onIndexChange?: (index: number) => void;
}

/** Scroll threshold (accumulated |deltaY|) that closes the lightbox. */
const SCROLL_CLOSE_THRESHOLD = 25;
/** Reset window for wheel accumulation (handles trackpad micro-deltas). */
const WHEEL_RESET_MS = 200;

export function Lightbox({
  isOpen,
  items,
  initialIndex = 0,
  labels,
  onClose,
  onIndexChange,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const wheelAccumRef = useRef(0);
  const wheelResetTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const itemCount = items.length;
  const isNavigable = itemCount > 1;

  // Open/close lifecycle: capture the trigger, scroll-lock the page, move
  // focus into the dialog; on close restore focus to the trigger.
  useEffect(() => {
    if (isOpen) {
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      if (returnFocusRef.current) {
        returnFocusRef.current.focus();
        returnFocusRef.current = null;
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  // ESC to close.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Notify the parent whenever the active index changes (sync carousel).
  useEffect(() => {
    if (isOpen) onIndexChange?.(currentIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentIndex]);

  if (!isOpen) return null;

  const item = items[currentIndex] ?? items[0];

  const goTo = (index: number) => {
    if (!isNavigable) return;
    setCurrentIndex((index + itemCount) % itemCount);
  };

  // Wheel close: accumulate |deltaY| on the overlay only; ignore events that
  // originate inside the media element (iframe internal scroll / video).
  const handleWheel = (event: ReactWheelEvent) => {
    const target = event.target as Element;
    if (target.closest('[data-lightbox-media]')) return;

    wheelAccumRef.current += Math.abs(event.deltaY);
    if (wheelResetTimerRef.current !== null) {
      window.clearTimeout(wheelResetTimerRef.current);
    }
    wheelResetTimerRef.current = window.setTimeout(() => {
      wheelAccumRef.current = 0;
      wheelResetTimerRef.current = null;
    }, WHEEL_RESET_MS);

    if (wheelAccumRef.current > SCROLL_CLOSE_THRESHOLD) {
      onClose();
    }
  };

  // Touch close: vertical drag over the overlay > 25px closes.
  const handleTouchStart = (event: ReactTouchEvent) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: ReactTouchEvent) => {
    const target = event.target as Element;
    if (target.closest('[data-lightbox-media]')) return;
    if (touchStartYRef.current === null) return;
    const currentY = event.touches[0]?.clientY ?? null;
    if (currentY === null) return;
    if (Math.abs(currentY - touchStartYRef.current) > SCROLL_CLOSE_THRESHOLD) {
      touchStartYRef.current = null;
      onClose();
    }
  };

  // Keyboard: ESC handled globally; arrows navigate; Tab is trapped.
  const handleDialogKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'ArrowRight' && isNavigable) {
      event.preventDefault();
      goTo(currentIndex + 1);
    } else if (event.key === 'ArrowLeft' && isNavigable) {
      event.preventDefault();
      goTo(currentIndex - 1);
    } else if (event.key === 'Tab') {
      trapTab(event);
    }
  };

  const trapTab = (event: ReactKeyboardEvent) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const focusable = Array.from(
      overlay.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute('disabled'));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const counterText = labels.counter
    .replace('{current}', String((currentIndex % itemCount) + 1))
    .replace('{total}', String(itemCount));

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={labels.dialogLabel}
      onKeyDown={handleDialogKeyDown}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onClick={(event) => {
        // Backdrop click: only when the click lands on the overlay itself.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label={labels.close}
      >
        ×
      </button>

      {isNavigable && (
        <button
          type="button"
          className={`${styles.navButton} ${styles.prevButton}`}
          onClick={() => goTo(currentIndex - 1)}
          aria-label={labels.prev}
        >
          ‹
        </button>
      )}

      <div className={styles.mediaWrapper}>
        {item.kind === 'image' && (
          <img
            src={item.src}
            alt={item.alt ?? ''}
            className={styles.mediaImage}
            data-lightbox-media="true"
          />
        )}
        {item.kind === 'video' && (
          <video
            src={item.src}
            poster={item.poster}
            controls
            className={styles.mediaVideo}
            data-lightbox-media="true"
          />
        )}
        {item.kind === 'iframe' && (
          <iframe
            src={item.src}
            sandbox={item.sandbox}
            title={item.title ?? labels.dialogLabel}
            className={styles.mediaIframe}
            data-lightbox-media="true"
          />
        )}
      </div>

      {isNavigable && (
        <button
          type="button"
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={() => goTo(currentIndex + 1)}
          aria-label={labels.next}
        >
          ›
        </button>
      )}

      <div className={styles.counter} aria-live="polite">
        {counterText}
      </div>
    </div>
  );
}