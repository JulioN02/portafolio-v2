import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { SuccessCaseResponse } from '@jsoft/shared';
import { SuccessCaseCard } from './SuccessCaseCard';

function makeSuccessCase(overrides: Partial<SuccessCaseResponse> = {}): SuccessCaseResponse {
  return {
    id: 'sc-1',
    title: 'Caso de éxito de prueba',
    slug: 'caso-de-exito-de-prueba',
    description: 'Descripción larga del caso de éxito para la tarjeta.',
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

describe('SuccessCaseCard', () => {
  it('fires onSelect with the successCase when the card is activated', () => {
    const successCase = makeSuccessCase();
    const onSelect = vi.fn();

    render(<SuccessCaseCard successCase={successCase} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /Caso de éxito de prueba/i }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(successCase);
  });

  it('renders an activatable button (no link navigation)', () => {
    const { container } = render(
      <SuccessCaseCard successCase={makeSuccessCase()} onSelect={vi.fn()} />,
    );

    expect(container.querySelector('a')).toBeNull();
    const button = screen.getByRole('button', { name: /Caso de éxito de prueba/i });
    expect(button).toHaveAttribute('type', 'button');
  });
});