import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectDetailModal } from './ProjectDetailModal';
import { LanguageProvider } from '../../i18n/LanguageContext';
import type { ProjectSummary } from '../../types';

const mockDetail = vi.fn();

vi.mock('../../hooks/useProjects', () => ({
  useProjectDetail: (type: string, slug: string) => mockDetail(type, slug),
}));

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

function makeSummary(overrides: Partial<ProjectSummary> = {}): ProjectSummary {
  return {
    id: 'p1',
    type: 'project',
    title: 'Proyecto de prueba',
    slug: 'proyecto-prueba',
    classification: 'proyecto-rapido',
    shortDescription: '<p>Descripción corta</p>',
    images: [],
    tags: ['proyecto-rapido', 'web'],
    ...overrides,
  };
}

function renderModal(project: ProjectSummary, onClose = () => undefined) {
  return render(
    <LanguageProvider>
      <ProjectDetailModal project={project} onClose={onClose} />
    </LanguageProvider>,
  );
}

/** Resolved detail for a plain project row (no extra fields). */
function resolvedProjectDetail() {
  return {
    data: {
      id: 'p1',
      title: 'Proyecto de prueba',
      slug: 'proyecto-prueba',
      body: '<p>Descripción rica</p>',
      repositoryUrl: 'https://github.com/example/proyecto',
      images: [],
      tags: ['proyecto-rapido', 'web'],
    },
    isLoading: false,
    isError: false,
    error: null,
  };
}

beforeEach(() => {
  emblaState.slideCount = 3;
  emblaState.api = null;
  mockDetail.mockReset();
  localStorage.setItem('site_language', 'es');
});

describe('ProjectDetailModal (preview)', () => {
  it('renders i18n type label, classification, title, sanitized shortDescription and the carousel region', () => {
    mockDetail.mockReturnValue(resolvedProjectDetail());

    const { container } = renderModal(
      makeSummary({
        images: ['https://example.com/cover.png', 'https://example.com/g1.png'],
      }),
    );

    expect(screen.getByRole('heading', { name: 'Proyecto de prueba' })).toBeInTheDocument();
    expect(screen.getByText('Proyecto')).toBeInTheDocument(); // type label (es)
    expect(screen.getByText('proyecto-rapido')).toBeInTheDocument(); // classification chip
    expect(screen.getByText('Descripción corta')).toBeInTheDocument();
    // Carousel region labeled with the shared gallery title key.
    expect(screen.getByRole('region', { name: 'Galería' })).toBeInTheDocument();
    // Cover-first slides: [image, ...images.slice(1)] dedup.
    const images = container.querySelectorAll('.mc-slide img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/cover.png');
    expect(images[1]).toHaveAttribute('src', 'https://example.com/g1.png');
  });

  it('dedups the cover image when project.image matches images[0]', () => {
    mockDetail.mockReturnValue(resolvedProjectDetail());

    const { container } = renderModal(
      makeSummary({
        image: 'https://example.com/cover.png',
        images: ['https://example.com/cover.png', 'https://example.com/g1.png', 'https://example.com/g2.png'],
      }),
    );

    const images = container.querySelectorAll('.mc-slide img');
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/cover.png');
    expect(images[1]).toHaveAttribute('src', 'https://example.com/g1.png');
    expect(images[2]).toHaveAttribute('src', 'https://example.com/g2.png');
  });

  it('uses the English dictionary when the site language is en', () => {
    localStorage.setItem('site_language', 'en');
    mockDetail.mockReturnValue(resolvedProjectDetail());

    renderModal(
      makeSummary({
        type: 'tool',
        title: 'Tool de prueba',
        images: ['https://example.com/cover.png'],
      }),
    );

    expect(screen.getByText('Tool')).toBeInTheDocument(); // type label (en)
    expect(screen.getByRole('region', { name: 'Gallery' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});

describe('ProjectDetailModal (lightbox)', () => {
  it('opens the lightbox at the clicked carousel slide and the counter syncs', async () => {
    mockDetail.mockReturnValue(resolvedProjectDetail());
    emblaState.slideCount = 2;

    renderModal(
      makeSummary({
        images: ['https://example.com/cover.png', 'https://example.com/g1.png'],
      }),
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Proyecto de prueba — Imagen 1 de 2' }),
    );

    // The modal overlay is also a dialog — scope to the Lightbox by its label.
    const dialog = await screen.findByRole('dialog', { name: 'Visor de imágenes' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/cover.png');
    expect(screen.getByText('1 de 2')).toBeInTheDocument();

    // Counter syncs on lightbox navigation.
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText('2 de 2')).toBeInTheDocument();
  });
});

describe('ProjectDetailModal (loading / error)', () => {
  it('shows the i18n loading message while the detail request is pending', () => {
    mockDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    renderModal(makeSummary());

    expect(screen.getByText('Cargando detalles técnicos...')).toBeInTheDocument();
    // Preview still visible from the grid summary.
    expect(screen.getByRole('heading', { name: 'Proyecto de prueba' })).toBeInTheDocument();
  });

  it('shows the i18n error message and the error detail on failure', () => {
    mockDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('boom'),
    });

    renderModal(makeSummary());

    expect(screen.getByText('No se pudieron cargar los detalles del proyecto.')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
  });

  it('falls back to the i18n connection-error label when error is not an Error instance', () => {
    mockDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: null,
    });

    renderModal(makeSummary());

    expect(screen.getByText('No se pudieron cargar los detalles del proyecto.')).toBeInTheDocument();
    expect(screen.getByText('Error de conexión')).toBeInTheDocument();
  });
});