import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ProductResponse } from '@jsoft/shared';
import { LanguageProvider } from '../../i18n/LanguageContext';

// ProductDetailPage renders a plain custom carousel (no MediaCarousel/embla),
// so no embla mock is required — only the data hook and trivial presentational
// wrappers need stubbing.

const mockQuery = vi.fn();

vi.mock('../../hooks/useProducts', () => ({
  useProductBySlug: (slug: string) => mockQuery(slug),
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

import { ProductDetailPage } from './ProductDetail';

function makeProduct(overrides: Partial<ProductResponse> = {}): ProductResponse {
  return {
    id: 'product-1',
    title: 'Producto de prueba',
    slug: 'producto-de-prueba',
    classification: 'Desarrollo',
    shortDescription: '<p>Descripción corta del producto</p>',
    fullDescription: '<p>Descripción completa del producto</p>',
    images: ['https://example.com/cover.png'],
    status: 'PUBLISHED',
    featured: false,
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
    <MemoryRouter initialEntries={['/productos/producto-de-prueba']}>
      <LanguageProvider>
        <ProductDetailPage />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockQuery.mockReset();
});

describe('ProductDetailPage technical sections (spec S11)', () => {
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

    expect(screen.getByRole('heading', { name: 'Producto no encontrado' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Volver a productos' })).toHaveAttribute(
      'href',
      '/productos',
    );
  });

  it('renders technicalExplanation and technicalImages sections below fullDescription (S11.1)', async () => {
    const product = makeProduct({
      fullDescription: '<p>Descripción completa del producto</p>',
      technicalExplanation: '<p>Explicación técnica del producto</p>',
      technicalImages: ['https://example.com/tech1.png', 'https://example.com/tech2.png'],
    });
    mockQuery.mockReturnValue({ data: product, isLoading: false, error: null });

    const { container } = renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Producto de prueba' })).toBeInTheDocument();
    expect(screen.getByText('Desarrollo')).toBeInTheDocument();
    expect(screen.getByText('Descripción corta del producto')).toBeInTheDocument();

    // Full description renders before the technical sections.
    expect(
      await screen.findByRole('heading', { name: 'Descripción completa' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Descripción completa del producto')).toBeInTheDocument();

    // Technical explanation + technical images headings with their content.
    expect(screen.getByRole('heading', { name: 'Detalles técnicos' })).toBeInTheDocument();
    expect(screen.getByText('Explicación técnica del producto')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Imágenes técnicas' })).toBeInTheDocument();

    // Technical images grid renders each image.
    const techImages = container.querySelectorAll('img[src^="https://example.com/tech"]');
    expect(techImages).toHaveLength(2);

    // Scripts never make it into the DOM (sanitized pipeline).
    expect(container.querySelector('script')).toBeNull();
  });

  it('omits technical sections when the optional fields are absent (S11.2)', async () => {
    mockQuery.mockReturnValue({ data: makeProduct(), isLoading: false, error: null });

    renderPage();

    // The rest of the page stays complete.
    expect(
      await screen.findByRole('heading', { name: 'Descripción completa' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Producto de prueba' })).toBeInTheDocument();

    // No technical headings render.
    expect(screen.queryByRole('heading', { name: 'Detalles técnicos' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Imágenes técnicas' })).toBeNull();
  });

  it('opens the Lightbox when a technical image is clicked', async () => {
    mockQuery.mockReturnValue({
      data: makeProduct({
        technicalImages: ['https://example.com/tech1.png', 'https://example.com/tech2.png'],
      }),
      isLoading: false,
      error: null,
    });

    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Producto de prueba — Imagen 1 de 2',
      }),
    );

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Visor de imágenes');
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/tech1.png');
    expect(screen.getByText('1 de 2')).toBeInTheDocument();
  });
});