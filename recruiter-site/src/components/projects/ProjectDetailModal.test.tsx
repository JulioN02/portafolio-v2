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

describe('ProjectDetailModal (preview→expand)', () => {
  it('project branch: collapsed by default; expand reveals sanitized body, tags and i18n repository link', async () => {
    mockDetail.mockReturnValue({
      data: {
        id: 'p1',
        title: 'Proyecto de prueba',
        slug: 'proyecto-prueba',
        body: '<p>Descripción rica</p><script>alert("xss")</script><figure><img src="/uploads/x.png" alt="diagrama"></figure>',
        repositoryUrl: 'https://github.com/example/proyecto',
        images: [],
        tags: ['proyecto-rapido', 'web'],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const { container } = renderModal(makeSummary());

    // Collapsed by default: no body/repo sections yet.
    expect(screen.queryByText('Descripción rica')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Ver repositorio →' })).toBeNull();

    const expandButton = screen.getByRole('button', { name: 'Ver completo' });
    expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(expandButton);

    // Sanitized body: script stripped, safe text + figure/img preserved.
    expect(await screen.findByText('Descripción rica')).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('figure img')).toHaveAttribute('src', '/uploads/x.png');
    // Tags rendered as chips (classification also shows 'proyecto-rapido').
    expect(screen.getAllByText('proyecto-rapido').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('web')).toBeInTheDocument();
    // i18n repository link.
    expect(screen.getByRole('link', { name: 'Ver repositorio →' })).toHaveAttribute(
      'href',
      'https://github.com/example/proyecto',
    );
    // Legacy technical sections hidden for real projects.
    expect(screen.queryByRole('heading', { name: 'Detalles técnicos' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Imágenes técnicas' })).toBeNull();

    // Control flips to collapse and content hides again.
    const collapseButton = screen.getByRole('button', { name: 'Ver menos' });
    expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(collapseButton);
    expect(screen.queryByText('Descripción rica')).toBeNull();
  });

  it('project branch: hides body and repository sections gracefully when fields are absent', async () => {
    mockDetail.mockReturnValue({
      data: {
        id: 'p1',
        title: 'Proyecto de prueba',
        slug: 'proyecto-prueba',
        body: '',
        repositoryUrl: undefined,
        images: [],
        tags: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    renderModal(makeSummary());

    fireEvent.click(screen.getByRole('button', { name: 'Ver completo' }));

    expect(screen.queryByRole('heading', { name: 'Descripción' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Ver repositorio →' })).toBeNull();
  });

  it('tool type: expand reveals fullDescription, technicalExplanation and technicalImages sections', async () => {
    mockDetail.mockReturnValue({
      data: {
        id: 't1',
        title: 'Tool de prueba',
        slug: 'tool-prueba',
        fullDescription: '<p>Descripción completa de la herramienta</p>',
        technicalExplanation: '<p>Explicación técnica de la herramienta</p>',
        technicalImages: ['https://example.com/tech1.png', 'https://example.com/tech2.png'],
        images: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const { container } = renderModal(
      makeSummary({ type: 'tool', title: 'Tool de prueba' }),
    );

    // Preview shows no detail sections until expanded.
    expect(screen.queryByRole('heading', { name: 'Descripción' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Ver completo' }));

    expect(await screen.findByRole('heading', { name: 'Descripción' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Detalles técnicos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Imágenes técnicas' })).toBeInTheDocument();
    expect(await screen.findByText('Descripción completa de la herramienta')).toBeInTheDocument();
    expect(screen.getByText('Explicación técnica de la herramienta')).toBeInTheDocument();

    // Technical images grid renders each image.
    const techImages = container.querySelectorAll('img[src^="https://example.com/tech"]');
    expect(techImages).toHaveLength(2);

    const collapseButton = screen.getByRole('button', { name: 'Ver menos' });
    expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(collapseButton);
    expect(screen.queryByRole('heading', { name: 'Descripción' })).toBeNull();
  });

  it('tool type: does not render empty technical section headings when optional fields are absent', async () => {
    mockDetail.mockReturnValue({
      data: {
        id: 't1',
        title: 'Tool de prueba',
        slug: 'tool-prueba',
        fullDescription: '<p>Descripción completa</p>',
        images: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    renderModal(makeSummary({ type: 'tool', title: 'Tool de prueba' }));

    fireEvent.click(screen.getByRole('button', { name: 'Ver completo' }));

    expect(await screen.findByRole('heading', { name: 'Descripción' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Detalles técnicos' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Imágenes técnicas' })).toBeNull();
  });

  it('successCase without videos or links hides the expand control', () => {
    mockDetail.mockReturnValue({
      data: {
        id: 's1',
        title: 'Caso de prueba',
        slug: 'caso-prueba',
        videos: [],
        links: [],
        images: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    renderModal(makeSummary({ type: 'successCase', title: 'Caso de prueba' }));

    expect(screen.queryByRole('button', { name: 'Ver completo' })).toBeNull();
  });

  it('successCase with videos and links: expand reveals native video and anchor list', async () => {
    mockDetail.mockReturnValue({
      data: {
        id: 's1',
        title: 'Caso de prueba',
        slug: 'caso-prueba',
        videos: ['https://example.com/video.mp4'],
        links: ['https://example.com/case'],
        images: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const { container } = renderModal(
      makeSummary({ type: 'successCase', title: 'Caso de prueba' }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ver completo' }));

    expect(await screen.findByRole('button', { name: 'Ver menos' })).toBeInTheDocument();
    const video = container.querySelector('video');
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute('src', 'https://example.com/video.mp4');
    expect(video).toHaveAttribute('controls');
    expect(screen.getByRole('link', { name: 'https://example.com/case' })).toHaveAttribute(
      'href',
      'https://example.com/case',
    );
  });

  it('disables the expand button while the detail request is loading', () => {
    mockDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    renderModal(makeSummary());

    const expandButton = screen.getByRole('button', { name: 'Ver completo' });
    expect(expandButton).toBeDisabled();
  });

  it('hides the expand button when the detail request failed', () => {
    mockDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('boom'),
    });

    renderModal(makeSummary());

    expect(screen.queryByRole('button', { name: 'Ver completo' })).toBeNull();
  });
});

describe('ProjectDetailModal (expanded lightbox)', () => {
  it('opens a single-item lightbox when a technical image is clicked', async () => {
    mockDetail.mockReturnValue({
      data: {
        id: 't1',
        title: 'Tool de prueba',
        slug: 'tool-prueba',
        fullDescription: '<p>Descripción completa</p>',
        technicalImages: ['https://example.com/tech1.png'],
        images: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const { container } = renderModal(
      makeSummary({ type: 'tool', title: 'Tool de prueba' }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ver completo' }));
    await screen.findByRole('heading', { name: 'Imágenes técnicas' });

    // The technical thumb is the button wrapping the technical image.
    const thumb = container
      .querySelector('img[src="https://example.com/tech1.png"]')
      ?.closest('button');
    expect(thumb).not.toBeNull();
    fireEvent.click(thumb as Element);

    const dialog = await screen.findByRole('dialog', { name: 'Visor de imágenes' });
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/tech1.png');
    // Single item → no navigation arrows.
    expect(screen.queryByRole('button', { name: 'Siguiente' })).toBeNull();
  });

  it('opens the lightbox when a body image inside the expanded content is clicked (delegation)', async () => {
    mockDetail.mockReturnValue({
      data: {
        id: 'p1',
        title: 'Proyecto de prueba',
        slug: 'proyecto-prueba',
        body: '<p>Descripción rica</p><figure><img src="/uploads/x.png" alt="diagrama"></figure>',
        images: [],
        tags: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const { container } = renderModal(makeSummary());

    fireEvent.click(screen.getByRole('button', { name: 'Ver completo' }));
    await screen.findByText('Descripción rica');

    fireEvent.click(container.querySelector('figure img') as Element);

    const dialog = await screen.findByRole('dialog', { name: 'Visor de imágenes' });
    expect(dialog.querySelector('img')).toHaveAttribute('src', '/uploads/x.png');
  });

  it('closes the lightbox first on Escape, then the modal on a second Escape', async () => {
    const onClose = vi.fn();
    mockDetail.mockReturnValue(resolvedProjectDetail());
    emblaState.slideCount = 2;

    renderModal(
      makeSummary({
        images: ['https://example.com/cover.png', 'https://example.com/g1.png'],
      }),
      onClose,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Proyecto de prueba — Imagen 1 de 2' }),
    );
    const lightboxDialog = await screen.findByRole('dialog', { name: 'Visor de imágenes' });
    expect(lightboxDialog).toBeInTheDocument();

    // First Escape: only the lightbox closes; the modal stays open.
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Visor de imágenes' })).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Proyecto de prueba' })).toBeInTheDocument();

    // Second Escape: the modal closes.
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});