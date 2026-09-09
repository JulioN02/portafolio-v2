import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ProductResponse } from '@jsoft/shared';
import { ProductCard } from './ProductCard';

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

describe('ProductCard', () => {
  it('fires onSelect with the product when the card is activated', () => {
    const product = makeProduct();
    const onSelect = vi.fn();

    render(<ProductCard product={product} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /Producto de prueba/i }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(product);
  });

  it('renders an activatable button (no link navigation)', () => {
    const { container } = render(
      <ProductCard product={makeProduct()} onSelect={vi.fn()} />,
    );

    expect(container.querySelector('a')).toBeNull();
    const button = screen.getByRole('button', { name: /Producto de prueba/i });
    expect(button).toHaveAttribute('type', 'button');
  });
});