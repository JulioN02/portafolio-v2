import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PROFILE } from '@jsoft/shared';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { Footer } from './Footer';
import { CONSENT_REOPEN_EVENT } from '../public/ConsentBanner';
import type { ReactNode } from 'react';

function renderWithProviders(ui: ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('Footer social links (CIN-3)', () => {
  it('renders no WhatsApp link and no PII literals (public-pii-minimization)', () => {
    const { container } = renderWithProviders(<Footer />);
    expect(screen.queryByRole('link', { name: 'WhatsApp' })).toBeNull();
    expect(container.innerHTML).not.toMatch(/wa\.me|tel:/i);
    expect(container.innerHTML).not.toContain('3727134');
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

describe('Footer privacy preferences button', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exposes the privacy preferences control with the ES label by default', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole('button', { name: 'Preferencias de privacidad' })).toBeInTheDocument();
  });

  it('reopens consent preferences and clears the stored choice on click', () => {
    localStorage.setItem('jsoft-consent-v1', 'accepted');
    const listener = vi.fn();
    window.addEventListener(CONSENT_REOPEN_EVENT, listener);
    renderWithProviders(<Footer />);
    screen.getByRole('button', { name: 'Preferencias de privacidad' }).click();
    expect(localStorage.getItem('jsoft-consent-v1')).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(CONSENT_REOPEN_EVENT, listener);
  });

  it('uses the English label when the stored language is en', async () => {
    localStorage.setItem('site_language', 'en');
    renderWithProviders(<Footer />);
    expect(await screen.findByRole('button', { name: 'Privacy preferences' })).toBeInTheDocument();
  });
});
