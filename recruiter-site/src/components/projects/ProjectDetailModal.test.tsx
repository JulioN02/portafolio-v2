import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProjectDetailModal } from './ProjectDetailModal';
import { LanguageProvider } from '../../i18n/LanguageContext';
import type { ProjectSummary } from '../../types';

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

/** Detail-route stub so "Ver Completo" navigation can be asserted. */
function DetailStub() {
  return <div data-testid="detail-page">detail page</div>;
}

function renderModal(project: ProjectSummary, onClose = () => undefined) {
  return render(
    <MemoryRouter initialEntries={['/proyectos']}>
      <Routes>
        <Route path="/proyectos/:tipo/:slug" element={<DetailStub />} />
        <Route
          path="*"
          element={
            <LanguageProvider>
              <ProjectDetailModal project={project} onClose={onClose} />
            </LanguageProvider>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

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

beforeEach(() => {
  emblaState.slideCount = 3;
  emblaState.api = null;
  localStorage.setItem('site_language', 'es');
});

describe('ProjectDetailModal (preview)', () => {
  it('renders i18n type label, classification, title, sanitized shortDescription and the carousel region', () => {
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

describe('ProjectDetailModal (close)', () => {
  it('closes via the close button and via the backdrop', () => {
    const onClose = vi.fn();
    renderModal(makeSummary(), onClose);

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Backdrop click (the overlay itself, not the modal panel).
    const overlay = document.querySelector('[role="dialog"][aria-label="Proyecto de prueba"]');
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay as Element);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('closes the lightbox first on Escape, then the modal on a second Escape', async () => {
    const onClose = vi.fn();
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

describe('ProjectDetailModal (Ver Completo navigation)', () => {
  it.each([
    ['service', 'Servicio'],
    ['product', 'Producto'],
    ['tool', 'Tool'],
    ['successCase', 'Caso de éxito'],
    ['project', 'Proyecto'],
  ] as const)(
    'closes the modal and navigates to /proyectos/%s/:slug for type %s',
    (type, _typeLabel) => {
      const onClose = vi.fn();
      const { unmount } = renderModal(
        makeSummary({ type, slug: 'mi-slug', title: 'Entidad de prueba' }),
        onClose,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Ver completo' }));

      // Modal closes first (state reset in the list page unmounts it)…
      expect(onClose).toHaveBeenCalledTimes(1);
      // …then the router lands on /proyectos/:tipo/:slug.
      expect(screen.getByTestId('detail-page')).toBeInTheDocument();
      unmount();
    },
  );

  it('shows the Ver Completo control for every type, even with minimal preview fields', () => {
    const { unmount } = renderModal(makeSummary({ type: 'successCase' }));
    expect(screen.getByRole('button', { name: 'Ver completo' })).toBeInTheDocument();
    unmount();

    renderModal(makeSummary({ images: [] }));
    expect(screen.getByRole('button', { name: 'Ver completo' })).toBeInTheDocument();
  });
});