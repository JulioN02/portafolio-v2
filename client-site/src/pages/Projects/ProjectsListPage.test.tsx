import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ProjectResponse } from '@jsoft/shared';
import { LanguageProvider } from '../../i18n/LanguageContext';

// Deterministic embla substitute — the preview modal renders a MediaCarousel,
// so the same hoisted fake used by BlogPostContent/EntityPreviewModal applies.
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

const mockProjects = vi.fn();
const mockTags = vi.fn();

vi.mock('../../hooks/useProjects', () => ({
  useProjects: (opts: unknown) => mockProjects(opts),
  useProjectTags: () => mockTags(),
}));

vi.mock('../../components/common/Loading', () => ({
  Loading: () => <div>loading...</div>,
}));

vi.mock('../../components/seo/MetaTags', () => ({
  MetaTags: () => null,
}));

import { ProjectsPage } from './ProjectsListPage';

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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/proyectos']}>
      <LanguageProvider>
        <ProjectsPage />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockProjects.mockReset();
  mockTags.mockReset();
  emblaState.slideCount = 3;
  emblaState.api = null;

  mockProjects.mockReturnValue({
    data: {
      data: [makeProject()],
      pagination: { page: 1, totalPages: 1, hasPrev: false, hasNext: false },
    },
    isLoading: false,
    error: null,
  });
  mockTags.mockReturnValue({ data: [], isLoading: false, error: null });
});

describe('ProjectsPage (preview wiring)', () => {
  it('renders project cards as activatable buttons (no link navigation)', () => {
    const { container } = renderPage();

    // URL stays on the list page; no card anchors.
    expect(container.querySelector('a')).toBeNull();
    const cardButton = screen.getByRole('button', { name: /Proyecto de prueba/i });
    expect(cardButton).toHaveAttribute('type', 'button');
  });

  it('opens the preview modal when a card is activated', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Proyecto de prueba/i }));

    // Shared Modal dialog appears with the preview content + Ver Completo.
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getAllByRole('heading', { name: 'Proyecto de prueba' }).length).toBeGreaterThanOrEqual(1);
    expect(within(dialog).getByText('automatizacion')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Ver completo' })).toBeInTheDocument();
  });

  it('closes the preview modal from the shared close button', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Proyecto de prueba/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});