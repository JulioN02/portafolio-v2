import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { BlogPostResponse } from '@jsoft/shared';
import { BlogPostContent } from './BlogPostContent';
import { LanguageProvider } from '../../i18n/LanguageContext';

// Deterministic embla substitute (jsdom cannot measure layouts). The fake
// keeps the real hook's public surface and returns a STABLE api across
// renders, wrapping the index modulo slideCount (mirrors `loop: true`).
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

function makePost(overrides: Partial<BlogPostResponse> = {}): BlogPostResponse {
  return {
    id: 'post-1',
    title: 'Publicación de prueba',
    slug: 'publicacion-de-prueba',
    category: 'Tutorial',
    shortDescription: 'Descripción corta de la publicación de prueba',
    coverImage: 'https://example.com/cover.png',
    body: '<p>Contenido seguro del cuerpo</p>',
    status: 'PUBLISHED',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    publishedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
    ...overrides,
  };
}

function renderPost(post: BlogPostResponse) {
  return render(
    <LanguageProvider>
      <BlogPostContent post={post} />
    </LanguageProvider>,
  );
}

beforeEach(() => {
  emblaState.slideCount = 3;
  emblaState.api = null;
});

describe('BlogPostContent (sanitization adoption)', () => {
  it('renders the body through sanitizeHtml: strips scripts and preserves inline media', async () => {
    const post = makePost({
      body: '<script>alert("xss")</script><figure><img src="/uploads/x.png" alt="diagrama"></figure><p>Contenido seguro del cuerpo</p>',
    });

    const { container } = renderPost(post);

    // Body is injected via innerHTML after the effect runs — wait for the safe text.
    expect(await screen.findByText('Contenido seguro del cuerpo')).toBeInTheDocument();
    // Script stripped by the media allowlist.
    expect(container.querySelector('script')).toBeNull();
    // Inline media node preserved.
    const img = container.querySelector('figure img');
    expect(img).toHaveAttribute('src', '/uploads/x.png');
    expect(img).toHaveAttribute('alt', 'diagrama');
  });

  it('sanitizes lessonsLearned the same way when present', async () => {
    const post = makePost({
      lessonsLearned: '<script>alert(1)</script><p>Lección segura</p>',
    });

    const { container } = renderPost(post);

    expect(await screen.findByText('Lección segura')).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
  });

  it('renders simulator placeholders as sandboxed iframes (no allow-same-origin)', async () => {
    const post = makePost({
      body: '<p>Intro</p><div data-simulator-id="abc123"></div><p>Fin</p>',
    });

    const { container } = renderPost(post);

    expect(await screen.findByText('Intro')).toBeInTheDocument();
    const iframe = container.querySelector('iframe') as HTMLIFrameElement | null;
    // REAL behavioral assertion: the placeholder div became a sandboxed iframe.
    expect(iframe).not.toBeNull();
    expect(iframe!.getAttribute('src')).toBe('/api/simulators/abc123/content');
    expect(iframe!.getAttribute('sandbox')).toBe('allow-scripts');
    expect(iframe!.getAttribute('sandbox')).not.toContain('allow-same-origin');
    // Placeholder div is gone from the DOM.
    expect(container.querySelector('[data-simulator-id]')).toBeNull();
  });
});

describe('BlogPostContent (media carousel + lightbox)', () => {
  it('renders the cover first and gallery slides in order inside the carousel', () => {
    const post = makePost({
      mediaGallery: ['https://example.com/g1.png', 'https://example.com/g2.png'],
    });

    const { container } = renderPost(post);

    const images = container.querySelectorAll('.mc-slide img');
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/cover.png');
    expect(images[1]).toHaveAttribute('src', 'https://example.com/g1.png');
    expect(images[2]).toHaveAttribute('src', 'https://example.com/g2.png');
    // Cover is the active slide on entry.
    const active = container.querySelector('[data-active-slide="true"]');
    expect(active?.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/cover.png',
    );
  });

  it('shows a pause control for multi-slide posts and hides it for cover-only posts', () => {
    const multi = renderPost(
      makePost({ mediaGallery: ['https://example.com/g1.png'] }),
    );
    expect(
      multi.getByRole('button', { name: 'Pausar' }),
    ).toBeInTheDocument();
    multi.unmount();

    const single = renderPost(makePost());
    expect(single.queryByRole('button', { name: 'Pausar' })).toBeNull();
  });

  it('opens the lightbox at the clicked carousel slide (cover first)', async () => {
    const post = makePost({
      mediaGallery: ['https://example.com/g1.png'],
    });

    renderPost(post);

    fireEvent.click(screen.getByRole('button', { name: 'Publicación de prueba' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Visor de imágenes');
    expect(
      screen.getByRole('img', { name: 'Publicación de prueba' }),
    ).toHaveAttribute('src', 'https://example.com/cover.png');
  });

  it('opens the lightbox when a body image is clicked (media stays in the body)', async () => {
    const post = makePost({
      body: '<p>Contenido seguro del cuerpo</p><figure><img src="/uploads/x.png" alt="diagrama"></figure>',
    });

    const { container } = renderPost(post);
    await screen.findByText('Contenido seguro del cuerpo');

    fireEvent.click(container.querySelector('figure img') as Element);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog.querySelector('img')).toHaveAttribute('src', '/uploads/x.png');
    // The body image is still in place.
    expect(container.querySelector('figure img')).toHaveAttribute(
      'src',
      '/uploads/x.png',
    );
  });

  it('adds an expand button to simulator iframes and opens the lightbox from it', async () => {
    const post = makePost({
      body: '<p>Intro</p><div data-simulator-id="abc123"></div><p>Fin</p>',
    });

    const { container } = renderPost(post);
    await screen.findByText('Intro');

    const expandButton = container.querySelector('[data-media-expand]');
    expect(expandButton).not.toBeNull();
    expect(expandButton).toHaveAttribute('aria-label', 'Ampliar');

    fireEvent.click(expandButton as Element);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const iframe = dialog.querySelector('iframe');
    expect(iframe).toHaveAttribute('src', '/api/simulators/abc123/content');
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
  });

  it('closes the lightbox on ESC', async () => {
    const post = makePost({
      body: '<p>Contenido seguro del cuerpo</p><img src="/uploads/x.png" alt="diagrama">',
    });

    const { container } = renderPost(post);
    await screen.findByText('Contenido seguro del cuerpo');
    fireEvent.click(container.querySelector('img[alt="diagrama"]') as Element);

    const dialog = await screen.findByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});