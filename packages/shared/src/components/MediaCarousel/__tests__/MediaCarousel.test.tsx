// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaCarousel } from '../MediaCarousel';
import type { MediaCarouselSlide } from '../MediaCarousel';

// Real embla relies on layout measurements that jsdom cannot provide (zero
// bounding rects), so we substitute a deterministic fake engine. The fake
// keeps the same public surface (selectedScrollSnap/scrollNext/scrollPrev/
// scrollTo/on), wraps the index modulo slideCount — mirroring `loop: true` —
// and returns a STABLE api instance across renders (like the real hook).
const { emblaState } = vi.hoisted(() => ({
  emblaState: {
    slideCount: 3,
    api: null as null | {
      selected: number;
      selectedScrollSnap: () => number;
      scrollNext: () => void;
      scrollPrev: () => void;
      scrollTo: (index: number) => void;
      on: (event: string, cb: (...args: unknown[]) => void) => void;
      off: () => void;
      reInit: () => void;
      destroy: () => void;
    },
  },
}));

vi.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => {
    if (!emblaState.api) {
      const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
      const emit = (event: string) => {
        (listeners[event] ?? []).forEach((cb) => cb(api));
      };
      const api = {
        selected: 0,
        selectedScrollSnap: () => api.selected,
        scrollNext: () => {
          api.selected = (api.selected + 1) % emblaState.slideCount;
          emit('select');
        },
        scrollPrev: () => {
          api.selected = (api.selected - 1 + emblaState.slideCount) % emblaState.slideCount;
          emit('select');
        },
        scrollTo: (index: number) => {
          api.selected = index;
          emit('select');
        },
        on: (event: string, cb: (...args: unknown[]) => void) => {
          (listeners[event] ??= []).push(cb);
        },
        off: () => {},
        reInit: () => {},
        destroy: () => {},
      };
      emblaState.api = api;
    }
    return [vi.fn(), emblaState.api];
  },
}));

const labels = {
  pause: 'Pausar',
  play: 'Reanudar',
  prev: 'Imagen anterior',
  next: 'Imagen siguiente',
  regionLabel: 'Galería',
};

const slides: MediaCarouselSlide[] = [
  { src: '/cover.png', alt: 'Portada' },
  { src: '/gallery-1.png', alt: 'Imagen 1' },
  { src: '/gallery-2.png', alt: 'Imagen 2' },
];

function getActiveSlide(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-active-slide="true"]');
}

beforeEach(() => {
  emblaState.slideCount = 3;
  emblaState.api = null;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('MediaCarousel', () => {
  it('renders the cover first and gallery slides in order; cover is the active slide on entry', () => {
    const { container } = render(<MediaCarousel slides={slides} labels={labels} />);

    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute('src', '/cover.png');
    expect(images[1]).toHaveAttribute('src', '/gallery-1.png');
    expect(images[2]).toHaveAttribute('src', '/gallery-2.png');

    const active = getActiveSlide(container);
    expect(active?.querySelector('img')).toHaveAttribute('src', '/cover.png');
  });

  it('renders a single slide statically: no autoplay, no prev/next, no pause control', async () => {
    vi.useFakeTimers();
    emblaState.slideCount = 1;
    const { container } = render(
      <MediaCarousel slides={[slides[0]]} labels={labels} />,
    );

    // No controls at all.
    expect(screen.queryByRole('button', { name: labels.prev })).toBeNull();
    expect(screen.queryByRole('button', { name: labels.next })).toBeNull();
    expect(screen.queryByRole('button', { name: labels.pause })).toBeNull();
    expect(screen.queryByRole('button', { name: labels.play })).toBeNull();

    // Autoplay never runs: advance well past the interval and assert no change.
    await act(async () => {
      vi.advanceTimersByTime(5000 * 3);
    });
    expect(getActiveSlide(container)?.querySelector('img')).toHaveAttribute(
      'src',
      '/cover.png',
    );
  });

  it('auto-advances with the configured interval, wrapping around at the end', async () => {
    vi.useFakeTimers();
    const { container } = render(<MediaCarousel slides={slides} labels={labels} />);

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(getActiveSlide(container)?.querySelector('img')).toHaveAttribute(
      'src',
      '/gallery-1.png',
    );

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(getActiveSlide(container)?.querySelector('img')).toHaveAttribute(
      'src',
      '/gallery-2.png',
    );

    // Loop wrap: next tick returns to the cover.
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(getActiveSlide(container)?.querySelector('img')).toHaveAttribute(
      'src',
      '/cover.png',
    );
  });

  it('pause toggles aria-pressed and halts advancing; resume restarts', async () => {
    vi.useFakeTimers();
    const { container } = render(<MediaCarousel slides={slides} labels={labels} />);

    const pauseButton = screen.getByRole('button', { name: labels.pause });
    expect(pauseButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(pauseButton);
    expect(pauseButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: labels.play })).toBeInTheDocument();

    // Halts: two intervals elapse, slide stays on the cover.
    await act(async () => {
      vi.advanceTimersByTime(5000 * 2);
    });
    expect(getActiveSlide(container)?.querySelector('img')).toHaveAttribute(
      'src',
      '/cover.png',
    );

    // Resume: interval restarts and advances again.
    fireEvent.click(screen.getByRole('button', { name: labels.play }));
    expect(pauseButton).toHaveAttribute('aria-pressed', 'false');
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(getActiveSlide(container)?.querySelector('img')).toHaveAttribute(
      'src',
      '/gallery-1.png',
    );
  });

  it('does not start autoplay when prefers-reduced-motion is reduce', async () => {
    vi.useFakeTimers();
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: () => false,
    } as unknown as MediaQueryList);

    const { container } = render(<MediaCarousel slides={slides} labels={labels} />);

    await act(async () => {
      vi.advanceTimersByTime(5000 * 2);
    });
    expect(getActiveSlide(container)?.querySelector('img')).toHaveAttribute(
      'src',
      '/cover.png',
    );
  });

  it('navigates with arrow keys when the region is focused', async () => {
    const { container } = render(<MediaCarousel slides={slides} labels={labels} />);

    const region = container.querySelector('[aria-label="Galería"]') as HTMLElement;
    expect(region).not.toBeNull();

    fireEvent.keyDown(region, { key: 'ArrowRight' });
    expect(getActiveSlide(container)?.querySelector('img')).toHaveAttribute(
      'src',
      '/gallery-1.png',
    );

    fireEvent.keyDown(region, { key: 'ArrowLeft' });
    expect(getActiveSlide(container)?.querySelector('img')).toHaveAttribute(
      'src',
      '/cover.png',
    );
  });

  it('exposes each slide as a button and fires onSlideClick with the slide index', async () => {
    const onSlideClick = vi.fn();
    const { container } = render(
      <MediaCarousel slides={slides} labels={labels} onSlideClick={onSlideClick} />,
    );

    // All slides are buttons with their alt as the accessible name.
    const slideButtons = container.querySelectorAll('button[aria-label]');
    expect(slideButtons.length).toBeGreaterThanOrEqual(3);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Imagen 2' }));
    expect(onSlideClick).toHaveBeenCalledWith(2);
  });

  it('keeps only the active slide in the tab order (roving tabIndex)', () => {
    const { container } = render(<MediaCarousel slides={slides} labels={labels} />);

    const buttons = Array.from(
      container.querySelectorAll('[data-active-slide] button'),
    ) as HTMLButtonElement[];
    expect(buttons[0]).toHaveAttribute('tabindex', '0');
    expect(buttons[1]).toHaveAttribute('tabindex', '-1');
    expect(buttons[2]).toHaveAttribute('tabindex', '-1');
  });
});