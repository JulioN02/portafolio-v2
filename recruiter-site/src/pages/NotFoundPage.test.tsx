import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from '../i18n/LanguageContext';
import { NotFoundPage } from './NotFoundPage';
import type { ReactNode } from 'react';

function renderWithProviders(ui: ReactNode) {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <LanguageProvider>{ui}</LanguageProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('NotFoundPage', () => {
  it('renders the 404 page with code and title', () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
    expect(
      screen.getByText('La página que buscas no existe o ha sido movida.'),
    ).toBeInTheDocument();
  });

  it('renders a link back to home', () => {
    renderWithProviders(<NotFoundPage />);

    const homeLink = screen.getByRole('link', { name: 'Volver al inicio' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
