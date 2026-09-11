import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { AreasDeAporte } from './AreasDeAporte';
import type { ReactNode } from 'react';

function renderWithProviders(ui: ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('AreasDeAporte', () => {
  it('renders the section title and the four contribution areas', () => {
    renderWithProviders(<AreasDeAporte />);

    expect(
      screen.getByRole('heading', { level: 2, name: '¿Qué puedo aportar?' }),
    ).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);
    expect(items.map((item) => item.querySelector('h3')?.textContent)).toEqual([
      'Backend y APIs',
      'Sistemas de negocio',
      'Datos y consistencia',
      'Automatización',
    ]);
  });

  it('renders each area description', () => {
    renderWithProviders(<AreasDeAporte />);

    expect(
      screen.getByText('Diseño y desarrollo de APIs y lógica de negocio con Node.js y TypeScript.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Modelado relacional, PostgreSQL, transacciones, concurrencia e idempotencia.'),
    ).toBeInTheDocument();
  });
});
