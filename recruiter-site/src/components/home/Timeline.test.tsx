import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { Timeline } from './Timeline';
import type { ReactNode } from 'react';

function renderWithProviders(ui: ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('Timeline (profile content)', () => {
  it('renders the four experience entries in chronological order', () => {
    renderWithProviders(<Timeline />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    const experienceRoles = headings.slice(0, 4).map((h) => h.textContent);
    expect(experienceRoles).toEqual([
      'Software Developer',
      'Soporte de Software y Operaciones',
      'Coordinador Logístico Nacional',
      'Operador Logístico',
    ]);
  });

  it('renders the three education entries and the languages line', () => {
    renderWithProviders(<Timeline />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    const educationRoles = headings.slice(4).map((h) => h.textContent);
    expect(educationRoles).toEqual([
      'Ingeniería de Sistemas',
      'Desarrollo de Software',
      'Programador Java Back-End',
    ]);
    expect(
      screen.getByText('Universidad Nacional Abierta y a Distancia (UNAD)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Platzi')).toBeInTheDocument();
    expect(screen.getByText('TodoCode Academy')).toBeInTheDocument();
    expect(screen.getByText('Español (nativo) · Inglés (A2)')).toBeInTheDocument();
  });

  it('renders the experience descriptions', () => {
    renderWithProviders(<Timeline />);
    expect(
      screen.getByText(
        'Desarrollo de aplicaciones, APIs y herramientas de software orientadas a necesidades técnicas y de negocio. Trabajo en análisis, modelado, implementación, testing y documentación.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Administración y soporte funcional de software para procesos documentales, nómina y operaciones, incluyendo gestión de información, seguimiento de procesos y resolución de incidencias.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Coordinación de operaciones logísticas, inventarios, transporte y trazabilidad de materiales en proyectos nacionales de distribución y operación.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Apoyo en recepción, almacenamiento, organización y movimiento de mercancía mediante herramientas tecnológicas de consulta y registro.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the education description for the Platzi entry', () => {
    renderWithProviders(<Timeline />);
    expect(
      screen.getByText(
        'Formación complementaria en programación, desarrollo web, backend, bases de datos y arquitectura de software.',
      ),
    ).toBeInTheDocument();
  });

  it('uses semantic time elements with YYYY dateTime for dated entries', () => {
    renderWithProviders(<Timeline />);

    const developerItem = screen
      .getByRole('heading', { level: 3, name: 'Software Developer' })
      .closest('li');
    const developerTime = developerItem?.querySelector('time');
    expect(developerTime?.textContent).toBe('2025 – Actualidad');
    expect(developerTime?.getAttribute('datetime')).toBe('2025');

    const coordinatorItem = screen
      .getByRole('heading', { level: 3, name: 'Coordinador Logístico Nacional' })
      .closest('li');
    const coordinatorTime = coordinatorItem?.querySelector('time');
    expect(coordinatorTime?.textContent).toBe('2018 – 2025');
    expect(coordinatorTime?.getAttribute('datetime')).toBe('2018');
  });

  it('renders two ordered lists (experience + education)', () => {
    const { container } = renderWithProviders(<Timeline />);
    expect(container.querySelectorAll('ol').length).toBe(2);
  });

  it('renders every entry with a period and never leaks raw translation keys', () => {
    const { container } = renderWithProviders(<Timeline />);
    // 4 experience + 3 education entries all carry a <time> period.
    expect(container.querySelectorAll('time').length).toBe(7);
    expect(container.textContent).not.toContain('timeline.exp.0.period');
    expect(container.textContent).not.toContain('timeline.edu.0.period');
  });
});
