import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ToolResponse } from '@jsoft/shared';
import { LanguageProvider } from '../../i18n/LanguageContext';

// Deterministic embla substitute (jsdom cannot measure layouts) — the inline
// ToolDetailModal renders a MediaCarousel, so the same hoisted fake used by
// BlogPostContent/ToolDetailModal tests applies here.
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

  it('renders a top back link and the ToolDetailModal inline on success', async () => {
    const tool = makeTool();
    mockQuery.mockReturnValue({ data: tool, isLoading: false, error: null });

    const { container } = renderPage();

    // Prominent back link at the top.
    expect(screen.getByRole('link', { name: '← Volver a herramientas' })).toHaveAttribute(
      'href',
      '/herramientas',
    );

    // The SAME shared modal component renders inline (not an overlay dialog).
    expect(screen.getByRole('article', { name: 'Detalles de la herramienta' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Herramienta de prueba' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();

    // Expanded by default: full description visible without an expand click.
    expect(await screen.findByText('Descripción completa de la herramienta')).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
  });
});