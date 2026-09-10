import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ToolResponse } from '@jsoft/shared';
import { LanguageProvider } from '../../i18n/LanguageContext';

// Deterministic embla substitute (jsdom cannot measure layouts) — the full
// tool page renders a MediaCarousel, so the same hoisted fake used by
// BlogPostContent/EntityPreviewModal tests applies here.
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

const mockQuery = vi.fn();

vi.mock('../../hooks/useTools', () => ({
  useToolBySlug: (slug: string) => mockQuery(slug),
}));

vi.mock('../../components/common/Loading', () => ({
  Loading: () => <div>loading...</div>,
}));

vi.mock('../../components/seo/MetaTags', () => ({
  MetaTags: () => null,
}));

vi.mock('../../components/forms/ContactForm', () => ({
  ContactForm: () => <div data-testid="contact-form" />,
}));

import { ToolDetailPage } from './ToolDetail';

function makeTool(overrides: Partial<ToolResponse> = {}): ToolResponse {
  return {
    id: 'tool-1',
    title: 'Herramienta de prueba',
    slug: 'herramienta-de-prueba',
    classification: 'Desarrollo',
    shortDescription: '<p>Descripción corta de la herramienta</p>',
    fullDescription: '<p>Descripción completa de la herramienta</p>',
    images: ['https://example.com/cover.png'],
    requiresInstall: false,
    featured: false,
    status: 'PUBLISHED',
    technicalExplanation: undefined,
    technicalImages: undefined,
    deletedAt: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    publishedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/herramientas/herramienta-de-prueba']}>
      <LanguageProvider>
        <ToolDetailPage />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockQuery.mockReset();
  emblaState.slideCount = 3;
  emblaState.api = null;
});

describe('ToolDetailPage', () => {
  it('renders the loading state while the slug is in flight', () => {
    mockQuery.mockReturnValue({ data: undefined, isLoading: true, error: null });

    renderPage();

    expect(screen.getByText('loading...')).toBeInTheDocument();
  });

  it('renders the not-found state with a back link for an unknown slug', () => {
    mockQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not Found'),
    });

    renderPage();

    expect(screen.getByRole('heading', { name: 'Herramienta no encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Volver a herramientas' })).toHaveAttribute(
      'href',
      '/herramientas',
    );
  });

  it('renders the full tool content inline (no modal) on success', async () => {
    const tool = makeTool({
      fullDescription: '<p>Descripción completa de la herramienta</p>',
      technicalExplanation: '<p>Explicación técnica de la herramienta</p>',
      technicalImages: ['https://example.com/tech1.png', 'https://example.com/tech2.png'],
      images: ['https://example.com/cover.png', 'https://example.com/g1.png'],
    });
    mockQuery.mockReturnValue({ data: tool, isLoading: false, error: null });

    const { container } = renderPage();

    // Prominent back link at the top.
    expect(screen.getByRole('link', { name: '← Volver a herramientas' })).toHaveAttribute(
      'href',
      '/herramientas',
    );

    // Full content rendered directly in the page — NO modal overlay, NO
    // inline modal article, NO expanded-state component.
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('article')).toBeNull();
    expect(screen.getByRole('heading', { level: 1, name: 'Herramienta de prueba' })).toBeInTheDocument();
    expect(screen.getByText('Desarrollo')).toBeInTheDocument();
    expect(screen.getByText('Descripción corta de la herramienta')).toBeInTheDocument();

    // Carousel region (MediaCarousel) with cover-first slides.
    expect(screen.getByRole('region', { name: 'Galería' })).toBeInTheDocument();
    const carouselImages = container.querySelectorAll('.mc-slide img');
    expect(carouselImages).toHaveLength(2);
    expect(carouselImages[0]).toHaveAttribute('src', 'https://example.com/cover.png');

    // Full description + technical explanation headings and sanitized content.
    expect(
      await screen.findByRole('heading', { name: 'Descripción completa' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Detalles técnicos' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Descripción completa de la herramienta')).toBeInTheDocument();
    expect(screen.getByText('Explicación técnica de la herramienta')).toBeInTheDocument();

    // Technical images grid renders each image.
    const techImages = container.querySelectorAll('img[src^="https://example.com/tech"]');
    expect(techImages).toHaveLength(2);

    // Scripts never make it into the DOM (sanitized pipeline).
    expect(container.querySelector('script')).toBeNull();
  });

  it('omits technical sections when the optional fields are absent', async () => {
    mockQuery.mockReturnValue({ data: makeTool(), isLoading: false, error: null });

    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Descripción completa' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Detalles técnicos' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Imágenes técnicas' })).toBeNull();
  });

  it('shows the requiresInstall badge only when the tool requires installation', async () => {
    mockQuery.mockReturnValue({
      data: makeTool({ requiresInstall: true }),
      isLoading: false,
      error: null,
    });

    renderPage();

    expect(await screen.findByText('⚙️ Requiere instalación')).toBeInTheDocument();
  });

  it('opens the lightbox when a carousel slide is clicked', async () => {
    mockQuery.mockReturnValue({
      data: makeTool({ images: ['https://example.com/cover.png', 'https://example.com/g1.png'] }),
      isLoading: false,
      error: null,
    });
    emblaState.slideCount = 2;

    renderPage();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Herramienta de prueba — Imagen 1 de 2' }),
    );

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Visor de imágenes');
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/cover.png');
    expect(screen.getByText('1 de 2')).toBeInTheDocument();
  });
});

describe('ToolDetailPage external link (spec entity-external-links)', () => {
  it('renders the view-website link in the header when externalLink is present', async () => {
    mockQuery.mockReturnValue({
      data: makeTool({ externalLink: 'https://example.com/herramienta', requiresInstall: true }),
      isLoading: false,
      error: null,
    });

    renderPage();

    const link = await screen.findByRole('link', { name: 'Ver sitio web →' });
    expect(link).toHaveAttribute('href', 'https://example.com/herramienta');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('omits the view-website link when externalLink is absent', async () => {
    mockQuery.mockReturnValue({ data: makeTool(), isLoading: false, error: null });

    renderPage();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Herramienta de prueba' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ver sitio web →' })).toBeNull();
  });
});