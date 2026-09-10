import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ServiceResponse } from '@jsoft/shared';
import { ServiceCard } from './ServiceCard';

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

describe('ServiceCard', () => {
  it('fires onSelect with the service when the card is activated', () => {
    const service = makeService();
    const onSelect = vi.fn();

    render(<ServiceCard service={service} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /Servicio de prueba/i }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(service);
  });

  it('renders an activatable button (no link navigation)', () => {
    const { container } = render(
      <ServiceCard service={makeService()} onSelect={vi.fn()} />,
    );

    // No anchor → no direct navigation semantics.
    expect(container.querySelector('a')).toBeNull();
    const button = screen.getByRole('button', { name: /Servicio de prueba/i });
    expect(button).toHaveAttribute('type', 'button');
  });
});