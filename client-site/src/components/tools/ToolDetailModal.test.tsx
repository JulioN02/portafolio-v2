import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ToolResponse } from '@jsoft/shared';
import { ToolDetailModal } from './ToolDetailModal';
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

vi.mock('../forms/ContactForm', () => ({
  ContactForm: ({ source }: { source?: string }) => (
    <div data-testid="contact-form">ContactForm: {source}</div>
  ),
}));

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

function renderModal(tool: ToolResponse) {
  return render(
    <LanguageProvider>
      <ToolDetailModal tool={tool} />
    </LanguageProvider>,
  );
}

beforeEach(() => {
  emblaState.slideCount = 3;
  emblaState.api = null;
});

describe('ToolDetailModal (preview)', () => {
  it('renders title, classification, sanitized shortDescription and the carousel region', () => {
    const tool = makeTool({
      images: ['https://example.com/cover.png', 'https://example.com/g1.png'],
    });

    const { container } = renderModal(tool);

    expect(screen.getByRole('heading', { name: 'Herramienta de prueba' })).toBeInTheDocument();
    expect(screen.getByText('Desarrollo')).toBeInTheDocument();
    expect(screen.getByText('Descripción corta de la herramienta')).toBeInTheDocument();
    // Carousel region labeled with the shared gallery title key.
    expect(screen.getByRole('region', { name: 'Galería' })).toBeInTheDocument();
    // Cover-first slides: images[0] is the cover, then each remaining image.
    const images = container.querySelectorAll('.mc-slide img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/cover.png');
    expect(images[1]).toHaveAttribute('src', 'https://example.com/g1.png');
  });

  it('shows the requiresInstall badge only when the tool requires installation', () => {
    const { unmount } = renderModal(makeTool({ requiresInstall: true }));
    expect(screen.getByText('⚙️ Requiere instalación')).toBeInTheDocument();
    unmount();

    renderModal(makeTool({ requiresInstall: false }));
    expect(screen.queryByText('⚙️ Requiere instalación')).toBeNull();
  });
});

describe('ToolDetailModal (preview→expand)', () => {
  it('expand reveals fullDescription, technicalExplanation and technicalImages sections and collapses back', async () => {
    const tool = makeTool({
      fullDescription: '<p>Descripción completa de la herramienta</p>',
      technicalExplanation: '<p>Explicación técnica de la herramienta</p>',
      technicalImages: ['https://example.com/tech1.png', 'https://example.com/tech2.png'],
    });

    const { container } = renderModal(tool);

    const expandButton = screen.getByRole('button', { name: 'Ver completo' });
    expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    expect(expandButton).toHaveAttribute('aria-controls', 'tool-detail-rich');

    fireEvent.click(expandButton);

    // Expanded headings appear.
    expect(
      await screen.findByRole('heading', { name: 'Descripción completa' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Detalles técnicos' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Imágenes técnicas' })).toBeInTheDocument();

    // Full body content rendered through the sanitized pipeline.
    expect(await screen.findByText('Descripción completa de la herramienta')).toBeInTheDocument();
    expect(screen.getByText('Explicación técnica de la herramienta')).toBeInTheDocument();

    // Technical images grid renders each image.
    const techImages = container.querySelectorAll('img[src^="https://example.com/tech"]');
    expect(techImages).toHaveLength(2);

    // Control flips to collapse.
    const collapseButton = screen.getByRole('button', { name: 'Ver menos' });
    expect(collapseButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(collapseButton);

    expect(screen.queryByRole('heading', { name: 'Descripción completa' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Detalles técnicos' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Imágenes técnicas' })).toBeNull();
  });

  it('does not render empty technical section headings when optional fields are absent', async () => {
    const tool = makeTool({
      fullDescription: '<p>Descripción completa de la herramienta</p>',
      // no technicalExplanation, no technicalImages
    });

    renderModal(tool);

    fireEvent.click(screen.getByRole('button', { name: 'Ver completo' }));

    expect(
      await screen.findByRole('heading', { name: 'Descripción completa' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Detalles técnicos' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Imágenes técnicas' })).toBeNull();
  });
});

describe('ToolDetailModal (lightbox)', () => {
  it('opens the lightbox at the clicked carousel slide and the counter syncs', async () => {
    const tool = makeTool({
      images: ['https://example.com/cover.png', 'https://example.com/g1.png'],
    });
    emblaState.slideCount = 2;

    renderModal(tool);

    fireEvent.click(screen.getByRole('button', { name: 'Herramienta de prueba — Imagen 1 de 2' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Visor de imágenes');
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/cover.png');
    expect(screen.getByText('1 de 2')).toBeInTheDocument();

    // Counter syncs on lightbox navigation.
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText('2 de 2')).toBeInTheDocument();
  });

  it('opens the lightbox when a body image inside fullDescription is clicked (delegation)', async () => {
    const tool = makeTool({
      fullDescription:
        '<p>Descripción completa de la herramienta</p><figure><img src="/uploads/x.png" alt="diagrama"></figure>',
    });

    const { container } = renderModal(tool);

    fireEvent.click(screen.getByRole('button', { name: 'Ver completo' }));
    await screen.findByText('Descripción completa de la herramienta');

    fireEvent.click(container.querySelector('figure img') as Element);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog.querySelector('img')).toHaveAttribute('src', '/uploads/x.png');
  });

  it('opens the lightbox with a single item when a technical image is clicked', async () => {
    const tool = makeTool({
      technicalImages: ['https://example.com/tech1.png'],
    });

    const { container } = renderModal(tool);

    fireEvent.click(screen.getByRole('button', { name: 'Ver completo' }));
    await screen.findByRole('heading', { name: 'Imágenes técnicas' });

    // The technical thumb is the button wrapping the technical image.
    const thumb = container
      .querySelector('img[src="https://example.com/tech1.png"]')
      ?.closest('button');
    expect(thumb).not.toBeNull();
    fireEvent.click(thumb as Element);

    const dialog = await screen.findByRole('dialog');
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/tech1.png');
    // Single item → no navigation arrows.
    expect(screen.queryByRole('button', { name: 'Siguiente' })).toBeNull();
  });
});

describe('ToolDetailModal (contact CTA)', () => {
  it('opens the nested contact modal from the CTA button', async () => {
    renderModal(makeTool());

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar información' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByTestId('contact-form')).toBeInTheDocument();
    expect(screen.getByTestId('contact-form')).toHaveTextContent('tool:Herramienta de prueba');
  });
});