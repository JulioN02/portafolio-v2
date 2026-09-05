import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PROFILE } from '@jsoft/shared';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { Footer } from './Footer';
import type { ReactNode } from 'react';

function renderWithProviders(ui: ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('Footer social links (CIN-3)', () => {
  it('points WhatsApp to the canonical PROFILE URL', () => {
    renderWithProviders(<Footer />);
    const whatsapp = screen.getByRole('link', { name: 'WhatsApp' });
    expect(whatsapp).toHaveAttribute('href', PROFILE.whatsappUrl);
  });

  it('points LinkedIn to the canonical PROFILE URL', () => {
    renderWithProviders(<Footer />);
    const linkedin = screen.getByRole('link', { name: 'LinkedIn' });
    expect(linkedin).toHaveAttribute('href', PROFILE.linkedinUrl);
  });

  it('points GitHub to the canonical PROFILE URL', () => {
    renderWithProviders(<Footer />);
    const github = screen.getByRole('link', { name: 'GitHub' });
    expect(github).toHaveAttribute('href', PROFILE.githubUrl);
  });

  it('points Email to the canonical PROFILE inbox', () => {
    renderWithProviders(<Footer />);
    const email = screen.getByRole('link', { name: 'Email' });
    expect(email).toHaveAttribute('href', `mailto:${PROFILE.email}`);
  });

  it('contains no mismatched contact values (CIN-4)', () => {
    const { container } = renderWithProviders(<Footer />);
    expect(container.innerHTML).not.toContain('573001234567');
    expect(container.innerHTML).not.toContain('info@jsoftsolutions.com');
  });
});