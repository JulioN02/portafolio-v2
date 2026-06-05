import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { BackButton } from './BackButton';
import type { ReactNode } from 'react';

function renderWithProviders(ui: ReactNode) {
  return render(
    <MemoryRouter>
      <LanguageProvider>{ui}</LanguageProvider>
    </MemoryRouter>,
  );
}

describe('BackButton', () => {
  it('renders with back translation text by default', () => {
    renderWithProviders(<BackButton to="/dashboard" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('← Volver');
  });

  it('renders with a custom label when provided', () => {
    renderWithProviders(<BackButton to="/dashboard" label="Custom Back" />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Custom Back');
  });
});
