import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type {
  ServiceResponse,
  ProductResponse,
  ToolResponse,
  SuccessCaseResponse,
  ProjectResponse,
} from '@jsoft/shared';
import { EntityPreviewModal, type PreviewEntity } from './EntityPreviewModal';
import type { PreviewEntityType } from '../../constants/entityRoutes';
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

// Detail-page stubs so "Ver Completo" navigation can be asserted per type.
function DetailStub({ id }: { id: string }) {
  return <div data-testid={id}>detail page</div>;
}

function renderPreview(preview: PreviewEntity, onClose = vi.fn()) {
  return render(
    <MemoryRouter>
      <Routes>
        <Route path="/servicios/:slug" element={<DetailStub id="detail-servicios" />} />
        <Route path="/productos/:slug" element={<DetailStub id="detail-productos" />} />
        <Route path="/herramientas/:slug" element={<DetailStub id="detail-herramientas" />} />
        <Route path="/casos-de-exito/:slug" element={<DetailStub id="detail-casos" />} />
        <Route path="/proyectos/:slug" element={<DetailStub id="detail-proyectos" />} />
        <Route
          path="*"
          element={
            <LanguageProvider>
              <EntityPreviewModal preview={preview} onClose={onClose} />
            </LanguageProvider>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

function makeService(overrides: Partial<ServiceResponse> = {}): ServiceResponse {
  return {
    id: 'svc-1',
    title: 'Servicio de prueba',
    slug: 'servicio-de-prueba',
    classification: 'Desarrollo',
    shortDescription: '<p>Descripción corta del servicio</p>',
    fullDescription: '<p>Descripción completa</p>',
    includedItems: ['Item'],
    images: ['https://example.com/cover.png'],
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

function makeProduct(overrides: Partial<ProductResponse> = {}): ProductResponse {
  return {
    id: 'prod-1',
    title: 'Producto de prueba',
    slug: 'producto-de-prueba',
    classification: 'Automatización',
    shortDescription: '<p>Descripción corta del producto</p>',
    fullDescription: '<p>Descripción completa</p>',
    images: ['https://example.com/cover.png'],
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

function makeTool(overrides: Partial<ToolResponse> = {}): ToolResponse {
  return {
    id: 'tool-1',
    title: 'Herramienta de prueba',
    slug: 'herramienta-de-prueba',
    classification: 'Desarrollo',
    shortDescription: '<p>Descripción corta de la herramienta</p>',
    fullDescription: '<p>Descripción completa</p>',
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

function makeSuccessCase(overrides: Partial<SuccessCaseResponse> = {}): SuccessCaseResponse {
  return {
    id: 'sc-1',
    title: 'Caso de éxito de prueba',
    slug: 'caso-de-exito-de-prueba',
    description: 'Descripción larga del caso de éxito que se muestra completa en la vista previa.',
    images: ['https://example.com/cover.png'],
    status: 'PUBLISHED',
    videos: undefined,
    links: undefined,
    deletedAt: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    publishedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

function makeProject(overrides: Partial<ProjectResponse> = {}): ProjectResponse {
  return {
    id: 'proj-1',
    title: 'Proyecto de prueba',
    slug: 'proyecto-de-prueba',
    shortDescription: '<p>Descripción corta del proyecto</p>',
    body: '<p>Cuerpo del proyecto</p>',
    images: ['https://example.com/cover.png'],
    tags: ['automatizacion'],
    featured: false,
    order: 0,
    status: 'PUBLISHED',
    deletedAt: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    publishedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

beforeEach(() => {
  emblaState.slideCount = 3;
  emblaState.api = null;
});

describe('EntityPreviewModal (per-type preview rendering)', () => {
  it('renders service preview: classification, title, sanitized shortDescription and carousel', () => {
    const { container } = renderPreview({ type: 'service', entity: makeService() });

    expect(screen.getByRole('heading', { name: 'Servicio de prueba' })).toBeInTheDocument();
    expect(screen.getByText('Desarrollo')).toBeInTheDocument();
    expect(screen.getByText('Descripción corta del servicio')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Galería' })).toBeInTheDocument();
    const images = container.querySelectorAll('.mc-slide img');
    expect(images).toHaveLength(1);
  });

  it('renders tool preview with the requiresInstall badge only when required', () => {
    const { unmount } = renderPreview({ type: 'tool', entity: makeTool({ requiresInstall: true }) });
    expect(screen.getByText('⚙️ Requiere instalación')).toBeInTheDocument();
    unmount();

    renderPreview({ type: 'tool', entity: makeTool({ requiresInstall: false }) });
    expect(screen.queryByText('⚙️ Requiere instalación')).toBeNull();
  });

  it('renders project preview: first tag chip + title + sanitized shortDescription, no classification', () => {
    const { container } = renderPreview({ type: 'project', entity: makeProject() });

    expect(screen.getByText('automatizacion')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Proyecto de prueba' })).toBeInTheDocument();
    expect(screen.getByText('Descripción corta del proyecto')).toBeInTheDocument();
    // Project schema has no classification field → never rendered.
    expect(container.querySelectorAll('.classification')).toHaveLength(0);
  });

  it('omits the tag chip when a project has no tags (absent sections omitted)', () => {
    renderPreview({ type: 'project', entity: makeProject({ tags: undefined }) });

    expect(screen.getByRole('heading', { name: 'Proyecto de prueba' })).toBeInTheDocument();
    expect(screen.queryByText('automatizacion')).toBeNull();
  });

  it('renders successCase preview: plain full description, no classification', () => {
    const { container } = renderPreview({ type: 'successCase', entity: makeSuccessCase() });

    expect(screen.getByRole('heading', { name: 'Caso de éxito de prueba' })).toBeInTheDocument();
    expect(
      screen.getByText('Descripción larga del caso de éxito que se muestra completa en la vista previa.'),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.classification')).toHaveLength(0);
  });

  it('renders the fallback image slide when a project has no images', () => {
    const { container } = renderPreview({
      type: 'project',
      entity: makeProject({ images: [] }),
    });

    const images = container.querySelectorAll('.mc-slide img');
    expect(images).toHaveLength(1);
    expect(images[0].getAttribute('src')).toContain('placehold.co');
  });
});

describe('EntityPreviewModal (Ver Completo navigation)', () => {
  it.each([
    ['service', 'detail-servicios'],
    ['product', 'detail-productos'],
    ['tool', 'detail-herramientas'],
    ['successCase', 'detail-casos'],
    ['project', 'detail-proyectos'],
  ] as const)('closes the modal and navigates to %s detail route', (type, testId) => {
    const previewByType: Record<PreviewEntityType, PreviewEntity> = {
      service: { type: 'service', entity: makeService() },
      product: { type: 'product', entity: makeProduct() },
      tool: { type: 'tool', entity: makeTool() },
      successCase: { type: 'successCase', entity: makeSuccessCase() },
      project: { type: 'project', entity: makeProject() },
    };

    const onClose = vi.fn();
    renderPreview(previewByType[type], onClose);

    fireEvent.click(screen.getByRole('button', { name: 'Ver completo' }));

    // Modal closes first (state reset in the list page unmounts the shared Modal).
    expect(onClose).toHaveBeenCalledTimes(1);
    // Then the router lands on the type's detail route.
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('shows the Ver Completo control for every type (always present)', () => {
    const { unmount } = renderPreview({ type: 'successCase', entity: makeSuccessCase() });
    expect(screen.getByRole('button', { name: 'Ver completo' })).toBeInTheDocument();
    unmount();

    renderPreview({ type: 'project', entity: makeProject({ tags: undefined, images: [] }) });
    expect(screen.getByRole('button', { name: 'Ver completo' })).toBeInTheDocument();
  });
});

describe('EntityPreviewModal (lightbox)', () => {
  it('opens the lightbox at the clicked carousel slide with the counter', async () => {
    const preview: PreviewEntity = {
      type: 'tool',
      entity: makeTool({
        images: ['https://example.com/cover.png', 'https://example.com/g1.png'],
      }),
    };
    emblaState.slideCount = 2;

    renderPreview(preview);

    fireEvent.click(screen.getByRole('button', { name: 'Herramienta de prueba — Imagen 1 de 2' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Visor de imágenes');
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/cover.png');
    expect(screen.getByText('1 de 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText('2 de 2')).toBeInTheDocument();
  });

  it('hides lightbox navigation arrows for a single image', async () => {
    const preview: PreviewEntity = {
      type: 'tool',
      entity: makeTool({ images: ['https://example.com/cover.png'] }),
    };
    emblaState.slideCount = 1;

    renderPreview(preview);

    fireEvent.click(screen.getByRole('button', { name: 'Herramienta de prueba — Imagen 1 de 1' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/cover.png');
    expect(screen.queryByRole('button', { name: 'Siguiente' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Anterior' })).toBeNull();
  });
});