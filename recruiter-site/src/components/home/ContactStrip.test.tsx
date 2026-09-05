import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PROFILE } from '@jsoft/shared';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { ContactStrip } from './ContactStrip';
import type { ReactNode } from 'react';

function renderWithProviders(ui: ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('ContactStrip (RHP-7, RHP-8)', () => {
  it('renders the email anchor with the canonical mailto href', () => {
    renderWithProviders(<ContactStrip />);
    const email = screen.getByRole('link', { name: new RegExp(PROFILE.email) });
    expect(email).toHaveAttribute('href', `mailto:${PROFILE.email}`);
    expect(email).not.toHaveAttribute('target');
  });

  it('renders the phone anchor with the canonical tel href and display', () => {
    renderWithProviders(<ContactStrip />);
    const phone = screen.getByRole('link', { name: new RegExp(PROFILE.phoneDisplay) });
    expect(phone).toHaveAttribute('href', PROFILE.phoneHref);
  });

  it('renders WhatsApp and LinkedIn anchors with canonical URLs and noopener rel', () => {
    renderWithProviders(<ContactStrip />);
    const whatsapp = screen.getByRole('link', { name: 'WhatsApp' });
    expect(whatsapp).toHaveAttribute('href', PROFILE.whatsappUrl);
    expect(whatsapp).toHaveAttribute('target', '_blank');
    expect(whatsapp).toHaveAttribute('rel', 'noopener noreferrer');

    const linkedin = screen.getByRole('link', { name: 'LinkedIn' });
    expect(linkedin).toHaveAttribute('href', PROFILE.linkedinUrl);
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