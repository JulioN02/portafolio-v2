import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { Header } from './Header';
import type { ReactNode } from 'react';

function renderWithProviders(ui: ReactNode) {
  return render(
    <MemoryRouter>
      <LanguageProvider>{ui}</LanguageProvider>
    </MemoryRouter>,
  );
}

describe('Header', () => {
  it('renders the logo with alt text', () => {
    renderWithProviders(<Header />);
    const logo = screen.getByAltText('J Soft Solutions');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/images/LogoJSS.png');
  });

  it('renders the logo text', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('J Soft Solutions')).toBeInTheDocument();
  });

  it('renders all navigation links in desktop nav', () => {
    renderWithProviders(<Header />);

    // Desktop nav links
    const homeLinks = screen.getAllByText('Inicio');
    expect(homeLinks.length).toBe(2); // desktop + mobile
    expect(homeLinks[0]).toHaveAttribute('href', '/');

    const projectLinks = screen.getAllByText('Proyectos');
    expect(projectLinks.length).toBe(2);
    expect(projectLinks[0]).toHaveAttribute('href', '/proyectos');

    const blogLinks = screen.getAllByText('Blog');
    expect(blogLinks.length).toBe(2);
    expect(blogLinks[0]).toHaveAttribute('href', '/blog');

    const contactLinks = screen.getAllByText('Contacto');
    expect(contactLinks.length).toBe(2);
    expect(contactLinks[0]).toHaveAttribute('href', '/contacto');
  });

  it('renders the language switcher button', () => {
    renderWithProviders(<Header />);
    // Default language is 'es', so the switcher shows 'EN'
    expect(screen.getByTitle('Switch to English')).toBeInTheDocument();
  });

  it('renders the hamburger menu button', () => {
    renderWithProviders(<Header />);
    const hamburger = screen.getByLabelText('Toggle menu');
    expect(hamburger).toBeInTheDocument();
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });
});
