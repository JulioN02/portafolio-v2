import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { StatsStrip } from './StatsStrip';
import type { ReactNode } from 'react';

function renderWithProviders(ui: ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('StatsStrip (profile content)', () => {
  it('renders the four owner metrics with values and labels', () => {
    renderWithProviders(<StatsStrip />);

    expect(screen.getByText('7+ años')).toBeInTheDocument();
    expect(
      screen.getByText('Experiencia en coordinación de procesos y operaciones'),
    ).toBeInTheDocument();
    expect(screen.getByText('2025–actualidad')).toBeInTheDocument();
    expect(screen.getByText('Desarrollo de software independiente')).toBeInTheDocument();
    expect(screen.getByText('4+ laboratorios')).toBeInTheDocument();
    expect(
      screen.getByText('Concurrencia, idempotencia, rendimiento y rate limiting'),
    ).toBeInTheDocument();
    expect(screen.getByText('Proyectos funcionales')).toBeInTheDocument();
    expect(
      screen.getByText('Aplicaciones, APIs y herramientas de desarrollo'),
    ).toBeInTheDocument();
  });

  it('uses a description list (dl) with one dt/dd pair per metric', () => {
    const { container } = renderWithProviders(<StatsStrip />);
    expect(container.querySelector('dl')).not.toBeNull();
    expect(container.querySelectorAll('dt').length).toBe(4);
    expect(container.querySelectorAll('dd').length).toBe(4);
  });
});
