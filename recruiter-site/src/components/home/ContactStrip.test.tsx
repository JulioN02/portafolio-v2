import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PROFILE } from '@jsoft/shared';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { ContactStrip } from './ContactStrip';
import type { ReactNode } from 'react';

function renderWithProviders(ui: ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('ContactStrip (public-pii-minimization)', () => {
  it('renders the email anchor with the canonical mailto href', () => {
    renderWithProviders(<ContactStrip />);
    const email = screen.getByRole('link', { name: new RegExp(PROFILE.email) });
    expect(email).toHaveAttribute('href', `mailto:${PROFILE.email}`);
    expect(email).not.toHaveAttribute('target');
  });

  it('renders no phone or WhatsApp link and no PII literals', () => {
    const { container } = renderWithProviders(<ContactStrip />);
    expect(screen.queryByRole('link', { name: /WhatsApp/ })).toBeNull();
    expect(screen.queryByRole('link', { name: /Teléfono|Phone/ })).toBeNull();
    expect(container.innerHTML).not.toMatch(/wa\.me|tel:/i);
    expect(container.innerHTML).not.toContain('3727134');
  });

  it('renders the LinkedIn anchor with canonical URL and noopener rel', () => {
    renderWithProviders(<ContactStrip />);
    const linkedin = screen.getByRole('link', { name: 'LinkedIn' });
    expect(linkedin).toHaveAttribute('href', PROFILE.linkedinUrl);
    expect(linkedin).toHaveAttribute('target', '_blank');
    expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the CV download link with aria-label and download attribute', () => {
    renderWithProviders(<ContactStrip />);
    const cv = screen.getByRole('link', { name: 'Descargar CV (PDF)' });
    expect(cv).toHaveAttribute('href', PROFILE.cvUrl);
    expect(cv).toHaveAttribute('download');
  });

  it('contains no mismatched contact values (CIN-4)', () => {
    const { container } = renderWithProviders(<ContactStrip />);
    expect(container.innerHTML).not.toContain('573001234567');
    expect(container.innerHTML).not.toContain('info@jsoftsolutions.com');
  });
});
