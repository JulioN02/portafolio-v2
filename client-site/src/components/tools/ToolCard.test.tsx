import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ToolResponse } from '@jsoft/shared';
import { ToolCard } from './ToolCard';

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

describe('ToolCard', () => {
  it('fires onSelect with the tool when the card is activated', () => {
    const tool = makeTool();
    const onSelect = vi.fn();

    render(<ToolCard tool={tool} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /Herramienta de prueba/i }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(tool);
  });

  it('renders an activatable button (no link navigation)', () => {
    const { container } = render(
      <ToolCard tool={makeTool()} onSelect={vi.fn()} />,
    );

    // No anchor → no navigation semantics.
    expect(container.querySelector('a')).toBeNull();
    const button = screen.getByRole('button', { name: /Herramienta de prueba/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });
});