import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PROFILE } from '@jsoft/shared';
import { techStack } from '../../data/tech-stack';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { StatsStrip } from './StatsStrip';
import type { ReactNode } from 'react';

function renderWithProviders(ui: ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('StatsStrip (RHP-5)', () => {
  it('renders the 100% availability/traceability metric from PROFILE + translations', () => {
    renderWithProviders(<StatsStrip />);
    expect(screen.getByText(PROFILE.availabilityMetric)).toBeInTheDocument();
    expect(screen.getByText('Disponibilidad y trazabilidad')).toBeInTheDocument();
  });

  it('renders the tech count derived from the tech-stack data file', () => {
    renderWithProviders(<StatsStrip />);
    const expected = techStack.reduce((acc, group) => acc + group.items.length, 0);
    expect(screen.getByText(String(expected))).toBeInTheDocument();
    expect(screen.getByText('Tecnologías en mi stack')).toBeInTheDocument();
  });

  it('renders the logistics years and English level metrics', () => {
    renderWithProviders(<StatsStrip />);
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Años en coordinación logística nacional')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
    expect(screen.getByText('Nivel de inglés')).toBeInTheDocument();
  });

  it('uses a description list (dl) for the metrics', () => {
    const { container } = renderWithProviders(<StatsStrip />);
    expect(container.querySelector('dl')).not.toBeNull();
    expect(container.querySelectorAll('dt').length).toBe(4);
    expect(container.querySelectorAll('dd').length).toBe(4);
  });
});