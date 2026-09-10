import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ServiceResponse } from '@jsoft/shared';
import { LanguageProvider } from '../../i18n/LanguageContext';

// ServiceDetailPage renders a plain custom carousel (no MediaCarousel/embla),
// so no embla mock is required — only the data hook and trivial presentational
// wrappers need stubbing.

const mockQuery = vi.fn();

vi.mock('../../hooks/useServices', () => ({
  useServiceBySlug: (slug: string) => mockQuery(slug),
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

import { ServiceDetailPage } from './ServiceDetail';

function makeService(overrides: Partial<ServiceResponse> = {}): ServiceResponse {
  return {
    id: 'service-1',
    title: 'Servicio de prueba',
    slug: 'servicio-de-prueba',
    classification: 'Consultoría',
    shortDescription: '<p>Descripción corta del servicio</p>',
    fullDescription: '<p>Descripción completa del servicio</p>',
    includedItems: ['Análisis', 'Implementación'],
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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/servicios/servicio-de-prueba']}>
      <LanguageProvider>
        <ServiceDetailPage />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockQuery.mockReset();
});

describe('ServiceDetailPage technical sections (spec S11)', () => {
  it('renders loading state while the slug is in flight', () => {
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

    expect(screen.getByRole('heading', { name: 'Servicio no encontrado' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Volver a servicios' })).toHaveAttribute(
      'href',
      '/servicios',
    );
  });

  it('renders technicalExplanation and technicalImages sections below fullDescription (S11.1)', async () => {
    const service = makeService({
      fullDescription: '<p>Descripción completa del servicio</p>',
      technicalExplanation: '<p>Explicación técnica del servicio</p>',
      technicalImages: ['https://example.com/tech1.png', 'https://example.com/tech2.png'],
    });
    mockQuery.mockReturnValue({ data: service, isLoading: false, error: null });

    const { container } = renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Servicio de prueba' })).toBeInTheDocument();
    expect(screen.getByText('Consultoría')).toBeInTheDocument();
    expect(screen.getByText('Descripción corta del servicio')).toBeInTheDocument();

    // Full description renders before the technical sections.
    expect(
      await screen.findByRole('heading', { name: 'Descripción completa' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Descripción completa del servicio')).toBeInTheDocument();

    // Technical explanation + technical images headings with their content.
    expect(screen.getByRole('heading', { name: 'Detalles técnicos' })).toBeInTheDocument();
    expect(screen.getByText('Explicación técnica del servicio')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Imágenes técnicas' })).toBeInTheDocument();

    // Technical images grid renders each image.
    const techImages = container.querySelectorAll('img[src^="https://example.com/tech"]');
    expect(techImages).toHaveLength(2);

    // Scripts never make it into the DOM (sanitized pipeline).
    expect(container.querySelector('script')).toBeNull();
  });

  it('omits technical sections when the optional fields are absent (S11.2)', async () => {
    mockQuery.mockReturnValue({ data: makeService(), isLoading: false, error: null });

    renderPage();

    // The rest of the page stays complete.
    expect(
      await screen.findByRole('heading', { name: 'Descripción completa' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Servicio de prueba' })).toBeInTheDocument();

    // No technical headings render.
    expect(screen.queryByRole('heading', { name: 'Detalles técnicos' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Imágenes técnicas' })).toBeNull();
  });

  it('opens the Lightbox when a technical image is clicked', async () => {
    mockQuery.mockReturnValue({
      data: makeService({
        technicalImages: ['https://example.com/tech1.png', 'https://example.com/tech2.png'],
      }),
      isLoading: false,
      error: null,
    });

    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Servicio de prueba — Imagen 1 de 2',
      }),
    );

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Visor de imágenes');
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/tech1.png');
    expect(screen.getByText('1 de 2')).toBeInTheDocument();
  });
});

describe('ServiceDetailPage external link (spec entity-external-links)', () => {
  it('renders the view-website link when externalLink is present', async () => {
    mockQuery.mockReturnValue({
      data: makeService({ externalLink: 'https://example.com/servicio' }),
      isLoading: false,
      error: null,
    });

    renderPage();

    const link = await screen.findByRole('link', { name: 'Ver sitio web →' });
    expect(link).toHaveAttribute('href', 'https://example.com/servicio');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('omits the view-website link when externalLink is absent', async () => {
    mockQuery.mockReturnValue({ data: makeService(), isLoading: false, error: null });

    renderPage();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Servicio de prueba' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ver sitio web →' })).toBeNull();
  });
});