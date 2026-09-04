import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { Timeline } from './Timeline';
import type { ReactNode } from 'react';

function renderWithProviders(ui: ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('Timeline (RHP-3, RHP-4, RHP-11)', () => {
  it('renders the four experience entries in chronological order (RHP-3)', () => {
    renderWithProviders(<Timeline />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    const experienceRoles = headings.slice(0, 4).map((h) => h.textContent);
    expect(experienceRoles).toEqual([
      'Consultor independiente',
      'Coordinador Logístico Nacional',
      'Soporte técnico',
      'Operador',
    ]);
  });

  it('renders the coordinator entry with the 100% availability/traceability metric', () => {
    renderWithProviders(<Timeline />);
    expect(screen.getByText('100% disponibilidad/trazabilidad')).toBeInTheDocument();
  });

  it('renders the three education entries and the languages line (RHP-4)', () => {
    renderWithProviders(<Timeline />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    const educationRoles = headings.slice(4).map((h) => h.textContent);
    expect(educationRoles).toEqual([
      'Ingeniería de Sistemas',
      'Desarrollo backend y JavaScript',
      'Desarrollo web',
    ]);
    expect(screen.getByText('UNAD')).toBeInTheDocument();
    expect(screen.getByText('PLATZI')).toBeInTheDocument();
    expect(screen.getByText('TodoCode')).toBeInTheDocument();
    expect(screen.getByText('Español (nativo) · Inglés (A2)')).toBeInTheDocument();
  });

  it('uses semantic time elements with YYYY-MM dateTime for dated entries', () => {
    renderWithProviders(<Timeline />);
    const consultant = screen.getByText('Ene 2025 – presente');
    expect(consultant.tagName).toBe('TIME');
    expect(consultant.getAttribute('datetime')).toBe('2025-01');

    const coordinator = screen.getByText('Ene 2018 – 2025');
    expect(coordinator.tagName).toBe('TIME');
    expect(coordinator.getAttribute('datetime')).toBe('2018-01');
  });

  it('renders two ordered lists (experience + education)', () => {
    const { container } = renderWithProviders(<Timeline />);
    expect(container.querySelectorAll('ol').length).toBe(2);
  });
});