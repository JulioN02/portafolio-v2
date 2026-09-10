import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { EntityDetailPage } from './EntityDetailPage';
import { LanguageProvider } from '../i18n/LanguageContext';

const mockDetail = vi.fn();

vi.mock('../hooks/useProjects', () => ({
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

interface MockQueryResult {
  data?: Record<string, unknown>;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  refetch?: () => void;
}

function resolvedDetail(overrides: Record<string, unknown> = {}): MockQueryResult {
  return {
    data: {
      id: 't1',
      title: 'Tool de prueba',
      slug: 'tool-prueba',
      shortDescription: '<p>Descripción corta</p>',
      images: ['https://example.com/cover.png'],
      ...overrides,
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
}

function renderPage(initialPath: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <LanguageProvider>
          <Routes>
            <Route path="/proyectos/:tipo/:slug" element={<EntityDetailPage />} />
            <Route path="/blog/:slug" element={<div data-testid="blog-stub">blog post</div>} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  emblaState.slideCount = 3;
  emblaState.api = null;
  mockDetail.mockReset();
  localStorage.setItem('site_language', 'es');
});

describe('EntityDetailPage (loading / error / notFound)', () => {
  it('shows the back link and i18n loading state while the detail is pending, no partial sections', () => {
    mockDetail.mockReturnValue({ isLoading: true, isError: false, error: null, data: undefined });

    renderPage('/proyectos/tool/tool-prueba');

    expect(screen.getByRole('link', { name: '← Volver a proyectos' })).toHaveAttribute(
      'href',
      '/proyectos',
    );
    expect(screen.getByText('Cargando detalles técnicos...')).toBeInTheDocument();
    // No partial content while loading.
    expect(screen.queryByRole('heading', { name: 'Tool de prueba' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Descripción' })).toBeNull();
  });

  it('shows the i18n error state with the error detail and a retry that refetches', () => {
    const refetch = vi.fn();
    mockDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('boom'),
      refetch,
    });

    renderPage('/proyectos/tool/tool-prueba');

    expect(
      screen.getByText('No se pudieron cargar los detalles del proyecto.'),
    ).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Intentar de nuevo' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders the i18n not-found state for an unknown tipo', () => {
    mockDetail.mockReturnValue({ isLoading: true, isError: false, error: null, data: undefined });

    renderPage('/proyectos/unknown/foo');

    expect(screen.getByRole('heading', { name: 'Detalle no encontrado' })).toBeInTheDocument();
    expect(
      screen.getByText('El elemento que buscas no existe o ha sido eliminado.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Volver a proyectos' })).toBeInTheDocument();
  });

  it('redirects laboratorio rows to the blog post page (defensive)', () => {
    mockDetail.mockReturnValue({ isLoading: true, isError: false, error: null, data: undefined });

    renderPage('/proyectos/laboratorio/simulador-circuitos');

    expect(screen.getByTestId('blog-stub')).toBeInTheDocument();
  });
});

describe('EntityDetailPage (per-type content)', () => {
  it('renders the back link, header, tags, sanitized body and repository link for a project', async () => {
    mockDetail.mockReturnValue(
      resolvedDetail({
        title: 'Proyecto de prueba',
        slug: 'proyecto-prueba',
        body: '<p>Cuerpo del proyecto</p><script>alert("xss")</script>',
        tags: ['proyecto-rapido', 'web'],
        repositoryUrl: 'https://github.com/example/proyecto',
        images: [],
      }),
    );

    const { container } = renderPage('/proyectos/project/proyecto-prueba');

    expect(screen.getByRole('link', { name: '← Volver a proyectos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Proyecto de prueba' })).toBeInTheDocument();
    expect(screen.getByText('Proyecto')).toBeInTheDocument(); // type label (es)
    expect(screen.getByText('Descripción corta')).toBeInTheDocument();
    expect(screen.getByText('proyecto-rapido')).toBeInTheDocument();
    expect(screen.getByText('web')).toBeInTheDocument();
    // Sanitized body: script stripped, safe text preserved.
    expect(await screen.findByText('Cuerpo del proyecto')).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
    // Repository link with the i18n label.
    expect(screen.getByRole('link', { name: 'Ver repositorio →' })).toHaveAttribute(
      'href',
      'https://github.com/example/proyecto',
    );
    // Project rows have no classification field → never rendered.
    expect(screen.queryByText('clasificacion')).toBeNull();
  });

  it('renders fullDescription, technicalExplanation and technicalImages sections for service/product/tool', async () => {
    mockDetail.mockReturnValue(
      resolvedDetail({
        classification: 'Desarrollo',
        fullDescription: '<p>Descripción completa</p>',
        technicalExplanation: '<p>Explicación técnica</p>',
        technicalImages: ['https://example.com/tech1.png', 'https://example.com/tech2.png'],
        images: ['https://example.com/cover.png', 'https://example.com/g1.png'],
      }),
    );

    const { container } = renderPage('/proyectos/tool/tool-prueba');

    expect(screen.getByText('Desarrollo')).toBeInTheDocument(); // classification chip
    expect(screen.getByRole('heading', { name: 'Descripción' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Detalles técnicos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Imágenes técnicas' })).toBeInTheDocument();
    expect(await screen.findByText('Descripción completa')).toBeInTheDocument();
    expect(screen.getByText('Explicación técnica')).toBeInTheDocument();
    // Technical grid renders every image.
    const techImages = container.querySelectorAll('img[src^="https://example.com/tech"]');
    expect(techImages).toHaveLength(2);
  });

  it('omits absent technical sections (no empty headings)', async () => {
    mockDetail.mockReturnValue(
      resolvedDetail({
        fullDescription: '<p>Descripción completa</p>',
        images: ['https://example.com/cover.png'],
      }),
    );

    renderPage('/proyectos/tool/tool-prueba');

    expect(await screen.findByText('Descripción completa')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Detalles técnicos' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Imágenes técnicas' })).toBeNull();
  });

  it('renders native videos and links for a successCase', () => {
    mockDetail.mockReturnValue(
      resolvedDetail({
        title: 'Caso de prueba',
        slug: 'caso-prueba',
        shortDescription: undefined,
        description: 'Descripción del caso',
        videos: ['https://example.com/video.mp4'],
        links: ['https://example.com/case'],
        images: ['https://example.com/cover.png'],
      }),
    );

    const { container } = renderPage('/proyectos/successCase/caso-prueba');

    expect(screen.getByRole('heading', { name: 'Caso de prueba' })).toBeInTheDocument();
    expect(screen.getByText('Descripción del caso')).toBeInTheDocument();
    const video = container.querySelector('video');
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute('src', 'https://example.com/video.mp4');
    expect(video).toHaveAttribute('controls');
    expect(screen.getByRole('link', { name: 'https://example.com/case' })).toHaveAttribute(
      'href',
      'https://example.com/case',
    );
  });
});

describe('EntityDetailPage (media + delegation)', () => {
  it('dedups the cover image in the carousel slides', () => {
    mockDetail.mockReturnValue(
      resolvedDetail({
        images: [
          'https://example.com/cover.png',
          'https://example.com/g1.png',
          'https://example.com/cover.png',
        ],
      }),
    );

    const { container } = renderPage('/proyectos/tool/tool-prueba');

    const images = container.querySelectorAll('.mc-slide img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/cover.png');
    expect(images[1]).toHaveAttribute('src', 'https://example.com/g1.png');
  });

  it('opens the page Lightbox at the clicked carousel slide', async () => {
    mockDetail.mockReturnValue(
      resolvedDetail({
        images: ['https://example.com/cover.png', 'https://example.com/g1.png'],
      }),
    );
    emblaState.slideCount = 2;

    renderPage('/proyectos/tool/tool-prueba');

    fireEvent.click(
      screen.getByRole('button', { name: 'Tool de prueba — Imagen 1 de 2' }),
    );

    const dialog = await screen.findByRole('dialog', { name: 'Visor de imágenes' });
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/cover.png');
    expect(screen.getByText('1 de 2')).toBeInTheDocument();
  });

  it('opens the page Lightbox from the technical images grid at the clicked index', async () => {
    mockDetail.mockReturnValue(
      resolvedDetail({
        fullDescription: '<p>Descripción completa</p>',
        technicalImages: ['https://example.com/tech1.png', 'https://example.com/tech2.png'],
      }),
    );

    const { container } = renderPage('/proyectos/tool/tool-prueba');

    await screen.findByRole('heading', { name: 'Imágenes técnicas' });

    const thumb = container
      .querySelector('img[src="https://example.com/tech2.png"]')
      ?.closest('button');
    expect(thumb).not.toBeNull();
    fireEvent.click(thumb as Element);

    const dialog = await screen.findByRole('dialog', { name: 'Visor de imágenes' });
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/tech2.png');
  });

  it('opens the Lightbox when a body image inside the rich content is clicked (delegation)', async () => {
    mockDetail.mockReturnValue(
      resolvedDetail({
        title: 'Proyecto de prueba',
        body: '<p>Cuerpo</p><figure><img src="/uploads/x.png" alt="diagrama"></figure>',
        images: [],
      }),
    );

    const { container } = renderPage('/proyectos/project/proyecto-prueba');

    await screen.findByText('Cuerpo');

    fireEvent.click(container.querySelector('figure img') as Element);

    const dialog = await screen.findByRole('dialog', { name: 'Visor de imágenes' });
    expect(dialog.querySelector('img')).toHaveAttribute('src', '/uploads/x.png');
  });
});